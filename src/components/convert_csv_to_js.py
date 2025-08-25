import csv

def convert_csv_to_js(csv_file_path, js_file_path):
    with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        next(reader)  # Skip header row
        
        books_by_school_grade = {}
        
        for row in reader:
            if len(row) >= 5 and row[1] and row[2] and row[3] and row[4]:
                title = row[1].strip()
                author = row[2].strip()
                grade = row[3].strip()
                school = row[4].strip()
                
                key = f"{school}_{grade}"
                if key not in books_by_school_grade:
                    books_by_school_grade[key] = []
                
                books_by_school_grade[key].append({
                    'title': title,
                    'author': author,
                    'grade': grade,
                    'school': school
                })
    
    # Generate JavaScript file
    with open(js_file_path, 'w', encoding='utf-8') as jsfile:
        jsfile.write("// filepath: grade_school_data.js\n")
        jsfile.write("const booksData = [\n")
        
        # Order: 초등학교 1-6학년, 중학교 1-3학년, 고등학교 1-3학년
        school_order = ["초등학교", "중학교", "고등학교"]
        grade_order = {
            "초등학교": ["1학년", "2학년", "3학년", "4학년", "5학년", "6학년"],
            "중학교": ["1학년", "2학년", "3학년"],
            "고등학교": ["1학년", "2학년", "3학년"]
        }
        
        first_entry = True
        
        for school in school_order:
            for grade in grade_order[school]:
                key = f"{school}_{grade}"
                if key in books_by_school_grade:
                    if not first_entry:
                        jsfile.write(",\n\n")
                    else:
                        first_entry = False
                    
                    jsfile.write(f"  // {school} {grade}\n")
                    
                    books = books_by_school_grade[key]
                    for i, book in enumerate(books):
                        if i > 0:
                            jsfile.write(",\n")
                        jsfile.write(f'  {{ title: "{book["title"]}", author: "{book["author"]}", grade: "{book["grade"]}", school: "{book["school"]}" }}')
        
        jsfile.write("\n];\n")
    
    print(f"Successfully converted {csv_file_path} to {js_file_path}")

# Run the conversion
convert_csv_to_js('books.csv', 'grade_school_data.js')