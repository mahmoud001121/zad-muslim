import json
import sys

# Read the current azkar data
with open('src/data/azkar.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Add fadl fields to existing entries based on their descriptions
enhanced_data = []
for i, entry in enumerate(data):
    # Create a copy of the entry
    enhanced_entry = entry.copy()
    
    # If there's no fadl field, use the description as fadl and create a shorter description
    if 'fadl' not in enhanced_entry:
        # For existing entries, we'll keep the description as fadl and create a brief description
        if 'description' in enhanced_entry and enhanced_entry['description']:
            enhanced_entry['fadl'] = enhanced_entry['description']
            # Create a shorter description based on content
            if 'الصباح' in enhanced_entry['category']:
                enhanced_entry['description'] = 'من أذكار الصباح النبوية'
            elif 'المساء' in enhanced_entry['category']:
                enhanced_entry['description'] = 'من أذكار المساء النبوية'
            elif 'النوم' in enhanced_entry['category']:
                enhanced_entry['description'] = 'من أذكار النوم النبوية'
            elif 'بعد الصلاة' in enhanced_entry['category']:
                enhanced_entry['description'] = 'من أذكار ما بعد الصلاة'
            elif 'الأكل' in enhanced_entry['category']:
                enhanced_entry['description'] = 'من أذكار الأكل والشرب'
            elif 'السفر' in enhanced_entry['category']:
                enhanced_entry['description'] = 'من أذكار السفر'
            else:
                enhanced_entry['description'] = 'من الأذكار النبوية'
    
    enhanced_data.append(enhanced_entry)

# Add new azkar entries
new_azkar = [
    {
        "id": len(enhanced_data) + 1,
        "category": "أذكار الصباح",
        "count": 3,
        "content": "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
        "description": "الإشهاد لله بالوحدانية والشهادة للنبي ﷺ بالعبودية والرسالة",
        "fadl": "من قالها أربع مرات حين يصبح أعتقه الله من النار",
        "reference": "أبو داود 4/318"
    },
    {
        "id": len(enhanced_data) + 2,
        "category": "أذكار الصباح",
        "count": 1,
        "content": "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
        "description": "شكر الله على نعم الصباح",
        "fadl": "من قالها حين يصبح فقد أدى شكر يومه",
        "reference": "أبو داود 4/318"
    },
    {
        "id": len(enhanced_data) + 3,
        "category": "أذكار المساء",
        "count": 3,
        "content": "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ",
        "description": "الإشهاد لله بالوحدانية والشهادة للنبي ﷺ بالعبودية والرسالة",
        "fadl": "من قالها أربع مرات حين يمسي أعتقه الله من النار",
        "reference": "أبو داود 4/318"
    },
    {
        "id": len(enhanced_data) + 4,
        "category": "أذكار المساء",
        "count": 1,
        "content": "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
        "description": "شكر الله على نعم المساء",
        "fadl": "من قالها حين يمسي فقد أدى شكر ليلته",
        "reference": "أبو داود 4/318"
    },
    {
        "id": len(enhanced_data) + 5,
        "category": "أذكار النوم",
        "count": 3,
        "content": "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
        "description": "الدعاء عند النوم بتفويض الأمر لله",
        "fadl": "من قالها ثم مات في نومه مات على الفطرة",
        "reference": "البخاري 11/126 ومسلم 4/2083"
    },
    {
        "id": len(enhanced_data) + 6,
        "category": "أذكار النوم",
        "count": 1,
        "content": "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        "description": "الاستعاذة من عذاب يوم القيامة",
        "fadl": "من قالها ثلاث مرات حين ينام كفاه الله شر ذلك اليوم",
        "reference": "الترمذي 5/473"
    },
    {
        "id": len(enhanced_data) + 7,
        "category": "أذكار بعد الصلاة",
        "count": 33,
        "content": "سُبْحَانَ اللهِ",
        "description": "التسبيح بعد الصلاة",
        "fadl": "من سبح الله دبر كل صلاة ثلاثًا وثلاثين وحمد الله ثلاثًا وثلاثين وكبر الله ثلاثًا وثلاثين وقال تمام المائة: لا إله إلا الله وحده لا شريك له له الملك وله الحمد وهو على كل شيء قدير، غفرت خطاياه وإن كانت مثل زبد البحر",
        "reference": "مسلم 1/418"
    },
    {
        "id": len(enhanced_data) + 8,
        "category": "أذكار بعد الصلاة",
        "count": 33,
        "content": "الْحَمْدُ لِلَّهِ",
        "description": "التحميد بعد الصلاة",
        "fadl": "من حمد الله دبر كل صلاة ثلاثًا وثلاثين وسبح الله ثلاثًا وثلاثين وكبر الله ثلاثًا وثلاثين وقال تمام المائة: لا إله إلا الله وحده لا شريك له له الملك وله الحمد وهو على كل شيء قدير، غفرت خطاياه وإن كانت مثل زبد البحر",
        "reference": "مسلم 1/418"
    },
    {
        "id": len(enhanced_data) + 9,
        "category": "أذكار بعد الصلاة",
        "count": 33,
        "content": "اللهُ أَكْبَرُ",
        "description": "التكبير بعد الصلاة",
        "fadl": "من كبر الله دبر كل صلاة ثلاثًا وثلاثين وسبح الله ثلاثًا وثلاثين وحمد الله ثلاثًا وثلاثين وقال تمام المائة: لا إله إلا الله وحده لا شريك له له الملك وله الحمد وهو على كل شيء قدير، غفرت خطاياه وإن كانت مثل زبد البحر",
        "reference": "مسلم 1/418"
    },
    {
        "id": len(enhanced_data) + 10,
        "category": "أذكار الأكل",
        "count": 1,
        "content": "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
        "description": "الدعاء بعد الأكل",
        "fadl": "من قالها بعد الأكل بارك الله له في طعامه وقاه عذاب النار",
        "reference": "ابن ماجه 2/1088"
    }
]

# Add the new entries
enhanced_data.extend(new_azkar)

# Write back to file
with open('src/data/azkar_enhanced.json', 'w', encoding='utf-8') as f:
    json.dump(enhanced_data, f, ensure_ascii=False, indent=2)

print(f"Enhanced {len(data)} entries and added {len(new_azkar)} new entries")
print(f"Total: {len(enhanced_data)} entries")
print("Saved to src/data/azkar_enhanced.json")
