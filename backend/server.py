"""
ScholarMatch - Python REST API & Static Server Alternative
Runs with standard Python 3.x library (no pip packages required).
"""

import http.server
import socketserver
import json
import os
import sys
import urllib.parse
import mimetypes
import random

PORT = int(os.environ.get('PORT', 5000))
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, 'data', 'schemes.json')
DEFAULT_DATA_FILE = os.path.join(BASE_DIR, 'data', 'default-schemes.json')
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

def load_schemes():
    try:
        if not os.path.exists(DATA_FILE):
            if os.path.exists(DEFAULT_DATA_FILE):
                with open(DEFAULT_DATA_FILE, 'r', encoding='utf-8') as f:
                    content = f.read()
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    f.write(content)
            else:
                return []
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print("Error loading schemes:", e)
        return []

def save_schemes(schemes):
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(schemes, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print("Error saving schemes:", e)
        return False

def normalize_profile(raw):
    try:
        income = float(raw.get('income') or raw.get('annualIncome') or 0)
    except:
        income = 0.0

    try:
        pct = float(raw.get('percentage') or 0)
    except:
        pct = 0.0

    if raw.get('cgpa') and not raw.get('percentage'):
        try:
            pct = min(100.0, round(float(raw['cgpa']) * 9.5, 1))
        except:
            pass
    elif 0 < pct <= 10.0:
        pct = min(100.0, round(pct * 9.5, 1))

    return {
        'name': (raw.get('name') or 'Student').strip(),
        'age': int(raw.get('age') or 20),
        'gender': raw.get('gender') or 'All',
        'state': (raw.get('state') or '').strip(),
        'district': (raw.get('district') or '').strip(),
        'dob': raw.get('dob') or '',
        'educationLevel': (raw.get('educationLevel') or '').strip(),
        'course': (raw.get('course') or 'All Courses').strip(),
        'yearOfStudy': (raw.get('yearOfStudy') or '1st Year').strip(),
        'percentage': max(0.0, min(100.0, pct)),
        'collegeType': raw.get('collegeType') or 'Government',
        'income': max(0.0, income),
        'hasIncomeCert': str(raw.get('hasIncomeCert')).lower() in ['true', 'yes', '1'],
        'familyMembers': int(raw.get('familyMembers') or 4),
        'parentOccupation': raw.get('parentOccupation') or '',
        'category': (raw.get('category') or 'General').strip(),
        'hasCasteCert': str(raw.get('hasCasteCert')).lower() in ['true', 'yes', '1'],
        'hasDisability': str(raw.get('hasDisability')).lower() in ['true', 'yes', '1'],
        'hasDomicileCert': str(raw.get('hasDomicileCert')).lower() in ['true', 'yes', '1'],
        'hasAadhaarBank': str(raw.get('hasAadhaarBank')).lower() in ['true', 'yes', '1'],
        'regNumber': raw.get('regNumber') or ''
    }

def check_eligibility(student, scheme):
    score = 0
    matched = []
    failed = []
    warnings = []
    reasons = []
    hard_disqualified = False

    # Gender
    gender_req = scheme.get('genderEligibility', 'All')
    if gender_req and gender_req != 'All':
        if student['gender'] and student['gender'] not in ['Prefer not to say', gender_req]:
            hard_disqualified = True
            failed.append(f"Exclusively for {gender_req} applicants")
            reasons.append(f"Scheme is designated exclusively for {gender_req} students.")
        else:
            matched.append(f"Gender criteria satisfied ({gender_req})")

    # Disability
    if scheme.get('requiresDisability', False):
        if not student['hasDisability']:
            hard_disqualified = True
            failed.append("Requires Person with Disability (PwD) certificate")
            reasons.append("Scheme is reserved for specially-abled candidates.")
        else:
            matched.append("PwD / Disability criteria satisfied")

    # Income (25 pts)
    max_inc = scheme.get('maxIncome', 0)
    if max_inc <= 0 or max_inc >= 9999999:
        score += 25
        matched.append("No income ceiling (open to all)")
    elif student['income'] <= max_inc:
        score += 25
        matched.append(f"Income within threshold (₹{student['income']:,.0f} <= ₹{max_inc:,.0f})")
    elif student['income'] <= max_inc * 1.15:
        score += 12
        warnings.append("Income slightly exceeds prescribed ceiling")
        reasons.append(f"Income is close to the threshold of ₹{max_inc:,.0f}.")
    else:
        failed.append(f"Income exceeds limit of ₹{max_inc:,.0f}")
        reasons.append(f"Family income exceeds the scheme limit of ₹{max_inc:,.0f}.")

    # Category (20 pts)
    eligible_cats = [c.lower() for c in scheme.get('eligibleCategories', [])]
    student_cat = student['category'].lower()
    if 'all' in eligible_cats or student_cat in eligible_cats or (student_cat == 'other' and 'other' in eligible_cats):
        score += 20
        matched.append(f"Category '{student['category']}' eligible")
    else:
        failed.append(f"Category '{student['category']}' not eligible (Requires: {', '.join(scheme.get('eligibleCategories', []))})")
        reasons.append(f"Scheme intended for {', '.join(scheme.get('eligibleCategories', []))} students.")

    # Education Level & Course (20 pts: 15 lvl + 5 crs)
    eligible_lvls = [l.lower() for l in scheme.get('eligibleEducationLevels', [])]
    student_lvl = student['educationLevel'].lower()
    if not eligible_lvls or 'all' in eligible_lvls or any(student_lvl in l or l in student_lvl for l in eligible_lvls):
        score += 15
        matched.append(f"Education level '{student['educationLevel']}' matches")
    else:
        failed.append(f"Education level mismatch (Requires: {', '.join(scheme.get('eligibleEducationLevels', []))})")
        reasons.append(f"Eligible for {', '.join(scheme.get('eligibleEducationLevels', []))} students.")

    eligible_courses = [c.lower() for c in scheme.get('eligibleCourses', [])]
    student_crs = student['course'].lower()
    if not eligible_courses or 'all courses' in eligible_courses or any(student_crs in c or c in student_crs for c in eligible_courses):
        score += 5
        matched.append(f"Course '{student['course']}' matches")
    else:
        warnings.append(f"Specific courses preferred: {', '.join(scheme.get('eligibleCourses', []))}")

    # Percentage (20 pts)
    min_pct = scheme.get('minPercentage', 0)
    if student['percentage'] >= min_pct:
        score += 20
        matched.append(f"Academic marks {student['percentage']}% meets requirement ({min_pct}%)")
    elif student['percentage'] >= min_pct - 5:
        score += 10
        warnings.append(f"Marks {student['percentage']}% close to requirement of {min_pct}%")
        reasons.append(f"Marks slightly below cut-off of {min_pct}%.")
    else:
        failed.append(f"Marks {student['percentage']}% below required {min_pct}%")
        reasons.append(f"Requires minimum {min_pct}% in qualifying exam.")

    # State (15 pts)
    scheme_state = scheme.get('state', 'All India').strip()
    if scheme_state.lower() in ['all india', 'central', '']:
        score += 15
        matched.append("Pan-India / Central Scheme")
    elif scheme_state.lower() == student['state'].lower():
        score += 15
        matched.append(f"State domicile matches ({scheme_state})")
    else:
        failed.append(f"Restricted to {scheme_state} residents")
        reasons.append(f"Scheme restricted to residents of {scheme_state}.")

    if hard_disqualified:
        score = min(score, 40)

    score = max(0, min(100, round(score)))
    if not hard_disqualified and score >= 75:
        status = 'eligible'
        eligible = True
        is_potential = False
    elif not hard_disqualified and score >= 50:
        status = 'potential'
        eligible = False
        is_potential = True
    else:
        status = 'not-eligible'
        eligible = False
        is_potential = False

    match_summary = (
        f"Excellent match! You satisfy {len(matched)} key criteria." if status == 'eligible'
        else "Potential match with conditional requirements." if status == 'potential'
        else (reasons[0] if reasons else "Criteria prerequisites not met.")
    )

    return {
        'schemeId': scheme.get('id'),
        'schemeName': scheme.get('name'),
        'eligible': eligible,
        'isPotential': is_potential,
        'status': status,
        'score': score,
        'matchedCriteria': matched,
        'failedCriteria': failed,
        'warnings': warnings,
        'reasons': reasons,
        'matchSummary': match_summary
    }

class ScholarMatchHandler(http.server.BaseHTTPRequestHandler):
    def end_headers_with_cors(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self.end_headers_with_cors(204)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        pathname = parsed.path

        if pathname == '/api/health':
            self.end_headers_with_cors(200)
            self.wfile.write(json.dumps({'status': 'ok', 'service': 'Python ScholarMatch Server'}).encode('utf-8'))
            return

        if pathname == '/api/schemes':
            schemes = load_schemes()
            self.end_headers_with_cors(200)
            self.wfile.write(json.dumps(schemes).encode('utf-8'))
            return

        if pathname.startswith('/api/schemes/'):
            scheme_id = pathname.split('/')[-1]
            schemes = load_schemes()
            found = next((s for s in schemes if s.get('id') == scheme_id), None)
            if found:
                self.end_headers_with_cors(200)
                self.wfile.write(json.dumps(found).encode('utf-8'))
            else:
                self.end_headers_with_cors(404)
                self.wfile.write(json.dumps({'error': 'Scheme not found'}).encode('utf-8'))
            return

        # Serve static files
        clean_path = pathname.lstrip('/')
        if not clean_path:
            clean_path = 'index.html'
        file_path = os.path.join(FRONTEND_DIR, clean_path)

        if not os.path.exists(file_path) or os.path.isdir(file_path):
            file_path = os.path.join(FRONTEND_DIR, 'index.html')

        mime, _ = mimetypes.guess_type(file_path)
        if not mime:
            mime = 'application/octet-stream'

        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', mime)
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 Not Found")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        pathname = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        raw_body = self.rfile.read(length).decode('utf-8') if length > 0 else '{}'
        try:
            body = json.loads(raw_body)
        except:
            body = {}

        if pathname == '/api/check-eligibility':
            profile_data = body.get('profile', body)
            student = normalize_profile(profile_data)
            schemes = load_schemes()

            matches = []
            for s in schemes:
                res = check_eligibility(student, s)
                matches.append({'scheme': s, 'matchResult': res})

            matches.sort(key=lambda m: (-m['matchResult']['score'], -m['scheme'].get('benefitAmount', 0)))

            eligible_cnt = sum(1 for m in matches if m['matchResult']['status'] == 'eligible')
            potential_cnt = sum(1 for m in matches if m['matchResult']['status'] == 'potential')
            not_cnt = sum(1 for m in matches if m['matchResult']['status'] == 'not-eligible')

            summary = {
                'total': len(matches),
                'eligible': eligible_cnt,
                'potential': potential_cnt,
                'notEligible': not_cnt,
                'profile': student,
                'matches': matches
            }
            self.end_headers_with_cors(200)
            self.wfile.write(json.dumps(summary).encode('utf-8'))
            return

        if pathname == '/api/schemes':
            schemes = load_schemes()
            new_scheme = dict(body)
            new_scheme['id'] = body.get('id') or f"scheme-{random.randint(1000, 9999)}"
            new_scheme['isDemo'] = True
            schemes.insert(0, new_scheme)
            save_schemes(schemes)
            self.end_headers_with_cors(201)
            self.wfile.write(json.dumps(new_scheme).encode('utf-8'))
            return

        if pathname == '/api/reset-schemes':
            if os.path.exists(DEFAULT_DATA_FILE):
                with open(DEFAULT_DATA_FILE, 'r', encoding='utf-8') as f:
                    content = f.read()
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    f.write(content)
                schemes = json.loads(content)
                self.end_headers_with_cors(200)
                self.wfile.write(json.dumps({'success': True, 'schemes': schemes}).encode('utf-8'))
            else:
                self.end_headers_with_cors(500)
                self.wfile.write(json.dumps({'error': 'Default data missing'}).encode('utf-8'))
            return

        if pathname == '/api/contact':
            ticket_id = f"SM-{random.randint(100000, 999999)}"
            self.end_headers_with_cors(200)
            self.wfile.write(json.dumps({
                'success': True,
                'ticketId': ticket_id,
                'message': f"Inquiry registered under #{ticket_id}. Assistance will be provided shortly."
            }).encode('utf-8'))
            return

        self.end_headers_with_cors(404)
        self.wfile.write(json.dumps({'error': 'Not found'}).encode('utf-8'))

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        pathname = parsed.path
        if pathname.startswith('/api/schemes/'):
            scheme_id = pathname.split('/')[-1]
            length = int(self.headers.get('Content-Length', 0))
            raw_body = self.rfile.read(length).decode('utf-8') if length > 0 else '{}'
            try:
                body = json.loads(raw_body)
            except:
                body = {}

            schemes = load_schemes()
            idx = next((i for i, s in enumerate(schemes) if s.get('id') == scheme_id), -1)
            if idx != -1:
                schemes[idx].update(body)
                schemes[idx]['id'] = scheme_id
                save_schemes(schemes)
                self.end_headers_with_cors(200)
                self.wfile.write(json.dumps(schemes[idx]).encode('utf-8'))
            else:
                self.end_headers_with_cors(404)
                self.wfile.write(json.dumps({'error': 'Scheme not found'}).encode('utf-8'))
            return
        self.end_headers_with_cors(404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        pathname = parsed.path
        if pathname.startswith('/api/schemes/'):
            scheme_id = pathname.split('/')[-1]
            schemes = load_schemes()
            initial_len = len(schemes)
            schemes = [s for s in schemes if s.get('id') != scheme_id]
            if len(schemes) < initial_len:
                save_schemes(schemes)
                self.end_headers_with_cors(200)
                self.wfile.write(json.dumps({'success': True, 'deletedId': scheme_id}).encode('utf-8'))
            else:
                self.end_headers_with_cors(404)
                self.wfile.write(json.dumps({'error': 'Scheme not found'}).encode('utf-8'))
            return
        self.end_headers_with_cors(404)

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), ScholarMatchHandler) as httpd:
        print(f"====================================================")
        print(f" ScholarMatch (Python) is running at: http://localhost:{PORT}")
        print(f"====================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
