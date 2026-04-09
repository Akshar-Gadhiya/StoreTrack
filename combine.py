import os

parts = [
    'c:\\zzz_use_this_for_storage\\StoreTrack\\report_part1.md',
    'c:\\zzz_use_this_for_storage\\StoreTrack\\report_part2.md',
    'c:\\zzz_use_this_for_storage\\StoreTrack\\report_part3.md',
    'c:\\zzz_use_this_for_storage\\StoreTrack\\report_part4.md'
]
output_file = 'c:\\zzz_use_this_for_storage\\StoreTrack\\PROJECT_REPORT.md'

with open(output_file, 'w', encoding='utf-8') as outfile:
    for part in parts:
        with open(part, 'r', encoding='utf-8') as infile:
            outfile.write(infile.read())
            outfile.write('\n\n')

print(f"Successfully combined {len(parts)} parts into {output_file}")
