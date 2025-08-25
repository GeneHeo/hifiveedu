import csv
import codecs
from collections import OrderedDict

def convert_csv_to_js(csv_file_path, js_file_path):
    # Use OrderedDict to preserve order
    books_by_school_grade = OrderedDict()

    # Open CSV with universal newline and BOM support
    with codecs.open(csv_file_path, 'r', encoding='utf-8-sig') as csvfile:
        reader = csv.reader(csvfile)
        header = next(reader)  # Skip header row

        for row in reader:
            if len(row) < 5:
                continue
            title = row[1].strip()
            author = row[2].strip()
            grade = row[3].strip()
            school = row[4].strip()
            if not (title and author and grade and school):
                continue

            key = (school, grade)
            if key not in books_by_school_grade:
                books_by_school_grade[key] = []
            books_by_school_grade[key].append({
                'title': title.replace('"', '\\"'),
                'author': author.replace('"', '\\"'),
                'grade': grade,
                'school': school
            })

    # Write JS file
    with open(js_file_path, 'w', encoding='utf-8') as jsfile:
        jsfile.write("// filepath: grade_school_data.js\n")
        jsfile.write("const booksData = [\n")

        first_section = True
        for (school, grade), books in books_by_school_grade.items():
            if not first_section:
                jsfile.write(",\n\n")
            else:
                first_section = False
            jsfile.write(f"  // {school} {grade}\n")
            for i, book in enumerate(books):
                if i > 0:
                    jsfile.write(",\n")
                jsfile.write(f'  {{ title: "{book["title"]}", author: "{book["author"]}", grade: "{book["grade"]}", school: "{book["school"]}" }}')
        jsfile.write("\n];\n")

    print(f"Successfully converted {csv_file_path} to {js_file_path}")

# Example usage:
# convert_csv_to_js('books.csv', 'grade_school_data.js')

if __name__ == "__main__":
    convert_csv_to_js('books.csv', 'grade_school_data.js')