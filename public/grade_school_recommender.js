// This variable will store the book data so we don't have to fetch it every time.
let bookDataCache = null;

// A robust function to fetch and parse the CSV file.
async function getBooksFromCSV() {
  // If we already loaded the data, return it immediately.
  if (bookDataCache) {
    return bookDataCache;
  }

  try {
    const response = await fetch('books.csv');
    if (!response.ok) {
      console.error("Could not fetch books.csv. Make sure the file is in the public folder.");
      return [];
    }
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const books = [];

    // Start from the second line to skip the header
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      
      if (cols.length >= 5) {
        books.push({
          title: (cols[1] || '').replace(/"/g, '').trim(),
          author: (cols[2] || '').replace(/"/g, '').trim(),
          grade: (cols[3] || '').trim(),
          school: (cols[4] || '').trim()
        });
      }
    }
    
    bookDataCache = books; // Store the data in our cache
    return bookDataCache;
  } catch (error) {
    console.error("Error processing books.csv:", error);
    return [];
  }
}

// Main function for this file. It tries to recommend based on the school/grade pattern.
// It returns a result object if successful, or null if the pattern doesn't match.
function recommendByGradeAndSchool(input) {
  // This function is now fully synchronous.
  const gradeSchoolMatch = input.match(/(초등학교|중학교|고등학교)\s*(\d+)\s*학년/);

  // If the input doesn't match the pattern, do nothing and return null.
  if (!gradeSchoolMatch) {
    return null;
  }

  // The 'booksData' variable comes from grade_school_data.js
  if (typeof booksData === 'undefined' || booksData.length === 0) {
    return { error: "학년별 추천 데이터가 로드되지 않았습니다." };
  }

  const school = gradeSchoolMatch[1];
  const grade = gradeSchoolMatch[2] + '학년';
  
  const filteredBooks = booksData.filter(book => book.school === school && book.grade === grade);

  if (filteredBooks.length > 0) {
    const pick = filteredBooks[Math.floor(Math.random() * filteredBooks.length)];
    return {
        title: pick.title,
        author: pick.author,
        source: `${school} ${grade} 추천`
    };
  } else {
    return { error: `해당 조건의 책이 없습니다: ${school} ${grade}` };
  }
}

// Pre-load the data for faster first-time use
getBooksFromCSV();