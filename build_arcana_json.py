"""
Builds arcanaList.json from the user's 97 Arcana definitions and links them
with Master ScobraCK characters and statistical parameter models.
"""
import json, re

# Master characters lookup
local_chars = json.load(open('/app/applet/src/data/mementoCharacters.json'))
char_by_name = {}
for c in local_chars:
    en_clean = c['nameEn'].lower().replace('’', "'")
    char_by_name[en_clean] = c
    # Also add base name before parenthesis, e.g. "cordie" from "Cordie (Summer's Reverb)"
    if '(' in en_clean:
        base_name = en_clean.split('(')[0].strip()
        if base_name not in char_by_name:
            char_by_name[base_name] = c

def find_char(name_raw):
    cleaned = name_raw.strip().lower().replace('’', "'")
    # specific aliases
    if 'summer sabrina' in cleaned:
        for c in local_chars:
            if 'sabrina' in c['nameEn'].lower() and 'summer' in c['nameEn'].lower(): return c
    if 'summer moddey' in cleaned:
        for c in local_chars:
            if 'moddey' in c['nameEn'].lower() and 'summer' in c['nameEn'].lower(): return c
    if 'summer cordie' in cleaned:
        for c in local_chars:
            if 'cordie' in c['nameEn'].lower() and 'summer' in c['nameEn'].lower(): return c
    if 'summer amleth' in cleaned:
        for c in local_chars:
            if 'amleth' in c['nameEn'].lower() and 'summer' in c['nameEn'].lower(): return c
    if 'ringmaster' in cleaned:
        for c in local_chars:
            if 'ringmaster' in c['nameEn'].lower(): return c
    if 'cerberus treasure' in cleaned or 'candy' in cleaned:
        for c in local_chars:
            if 'cerberus' in c['nameEn'].lower() and 'candy' in c['nameEn'].lower(): return c
    if 'fenrir treasure' in cleaned:
        for c in local_chars:
            if 'fenrir' in c['nameEn'].lower() and 'treasured' in c['nameEn'].lower(): return c
    if 'a.a uniform' in cleaned:
        for c in local_chars:
            if 'a.a' in c['nameEn'].lower() and 'sky' in c['nameEn'].lower(): return c
    if 'a.a' in cleaned:
        for c in local_chars:
            if 'a.a' in c['nameEn'].lower(): return c
    if 'witch illya' in cleaned:
        for c in local_chars:
            if 'illya' in c['nameEn'].lower() and 'witch' in c['nameEn'].lower(): return c
    if 'festive natasha' in cleaned:
        for c in local_chars:
            if 'natasha' in c['nameEn'].lower() and 'festive' in c['nameEn'].lower(): return c
    if 'apostle rosalie' in cleaned:
        for c in local_chars:
            if 'rosalie' in c['nameEn'].lower(): return c

    # Exact or starts with
    for c in local_chars:
        if c['nameEn'].lower() == cleaned:
            return c
    for c in local_chars:
        if c['nameEn'].lower().startswith(cleaned):
            return c
        
    return None

def parse_stat_line(text):
    # Returns list of { param, type: 'flat' | 'perLevel' | 'pct', value }
    bonuses = []
    # Replace commas in decimals, e.g. 7,00% -> 7.00%
    text = re.sub(r'(\d+),(\d+)', r'\1.\2', text)
    # Match patterns like:
    # P. DEF = 500
    # P. CRIT DMG Cut = 7.00%
    # ACC = Chara Lvl * 70
    # EVD = Chara Lvl * 25
    # Counter = 1.50%
    # Debuff ACC = 0.70%
    items = re.findall(r'([A-Za-z0-9\.\s\/\-]+?)\s*=\s*([^\t\n\r]+)', text)
    for stat_raw, val_raw in items:
        s = stat_raw.strip().upper()
        v = val_raw.strip()
        
        param = None
        if 'P. DEF' in s or 'P.DEF' in s: param = 'pDef'
        elif 'M. DEF' in s or 'M.DEF' in s: param = 'mDef'
        elif 'P. CRIT' in s or 'P.CRIT' in s: param = 'pCritCut'
        elif 'M. CRIT' in s or 'M.CRIT' in s: param = 'mCritCut'
        elif 'CRIT DMG BOOST' in s: param = 'critDmgBoost'
        elif 'CRIT RES' in s or 'C. RES' in s: param = 'critRes'
        elif 'CRIT' in s: param = 'crit'
        elif 'DEBUFF RES' in s: param = 'debuffRes'
        elif 'DEBUFF ACC' in s or 'DEBUFF HIT' in s: param = 'debuffHit'
        elif 'PM. DEF BREAK' in s or 'PM.DEF BREAK' in s: param = 'pmDefBreak'
        elif 'DEF BREAK' in s: param = 'defPen'
        elif 'EVD' in s: param = 'evasion'
        elif 'ACC' in s: param = 'hit'
        elif 'COUNTER' in s: param = 'counter'
        elif 'DRAIN' in s or 'HP DRAIN' in s: param = 'hpDrain'
        elif 'STR' in s: param = 'str'
        elif 'DEX' in s: param = 'dex'
        elif 'MAG' in s: param = 'mag'
        elif 'STA' in s: param = 'sta'
        elif 'HP' in s: param = 'hp'
        elif 'ATK' in s: param = 'atk'
        elif 'DEF' in s: param = 'def'

        if not param:
            continue

        # Check value format
        if 'chara lvl' in v.lower() or 'lvl' in v.lower() or '*' in v:
            # perLevel
            m = re.search(r'\*\s*(\d+(?:\.\d+)?)', v)
            if m:
                val = float(m.group(1))
                if val > 0:
                    bonuses.append({'param': param, 'type': 'perLevel', 'value': val})
        elif '%' in v or '&' in v:
            # percentage
            m = re.search(r'(\d+(?:\.\d+)?)', v)
            if m:
                val = float(m.group(1))
                if val > 0:
                    bonuses.append({'param': param, 'type': 'pct', 'value': val})
        else:
            # flat
            m = re.search(r'(\d+(?:\.\d+)?)', v)
            if m:
                val = float(m.group(1))
                if val > 0:
                    bonuses.append({'param': param, 'type': 'flat', 'value': val})

    return bonuses

print('Helper functions loaded successfully!')
