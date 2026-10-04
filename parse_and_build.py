import re, json

raw_prompt = """
1. Taurus Protection
Arcana Group: Amleth (Azure), Moddey (Azure)
Unlock: SR	to Arcana Group		Bonus: P. DEF = 500	M. DEF = 0
	UR	to Arcana Group		Bonus: P. DEF = 3000	M. DEF = 3000
	LR	to All Character	Bonus: P. DEF = 3000	M. DEF = 3000
	LR+5	to All Character 	Bonus: P. DEf = 3000	M. DEF = 3000
	LR+6	to All Character	Bonus: P. DEF = 4000	M. DEF = 4000
	LR+7	to All Character	Bonus: P. DEF = 5000	M. DEF = 5000
	LR+8	to All Character	Bonus: P. DEF = 6000	M. DEF = 6000
	LR+9	to All Character	Bonus: P. DEF = 7000	M. DEF = 7000
	LR+10	to All Character	Bonus: P. DEF = 8000	M. DEF = 8000

2. Lynx Dance
Arcana Group: Mimi (Amber), Hathor (Amber)
Unlock: SR	to Arcana Group		Bonus: P. CRIT DMG Cut = 7,00%	C. RES = 0
	UR	to Arcana Group		Bonus: P. CRIT DMG Cut = 15,0%	C. RES = 1500
	LR	to All Character	Bonus: P. CRIT DMG Cut = 15,0%	C. RES = 1500
	LR+5	to All Character 	Bonus: P. CRIT DMG Cut = 15,0%	C. RES = 1500
	LR+6	to All Character	Bonus: P. CRIT DMG Cut = 16,0%	C. RES = 2000
	LR+7	to All Character	Bonus: P. CRIT DMG Cut = 17,0%	C. RES = 2500
	LR+8	to All Character	Bonus: P. CRIT DMG Cut = 18,0%	C. RES = 3000
	LR+9	to All Character	Bonus: P. CRIT DMG Cut = 19,0%	C. RES = 3500
	LR+10	to All Character	Bonus: P. CRIT DMG Cut = 20,0%	C. RES = 4000
"""

print('Script template ready')
