// Book validation
export const validateBook = (book) => {
  const errors = {};
  
  if (!book.isbn?.trim()) {
    errors.isbn = 'ISBN is required';
  } else if (book.isbn.length < 10) {
    errors.isbn = 'ISBN must be at least 10 characters';
  }
  
  if (!book.title?.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!book.author?.trim()) {
    errors.author = 'Author is required';
  }
  
  if (book.copies === undefined || book.copies === '') {
    errors.copies = 'Number of copies is required';
  } else if (isNaN(book.copies) || parseInt(book.copies) < 0) {
    errors.copies = 'Copies must be a non-negative number';
  }
  
  return errors;
};

// Member validation
export const validateMember = (member) => {
  const errors = {};
  
  if (!member.name?.trim()) {
    errors.name = 'Name is required';
  } else if (member.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  
  if (!member.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
    errors.email = 'Invalid email address';
  }
  
  return errors;
};

// Loan validation
export const validateLoan = (loan) => {
  const errors = {};
  
  if (!loan.memberId) {
    errors.memberId = 'Member is required';
  }
  
  if (!loan.bookId) {
    errors.bookId = 'Book is required';
  }
  
  if (!loan.loanedAt) {
    errors.loanedAt = 'Loan date is required';
  } else if (new Date(loan.loanedAt) > new Date()) {
    errors.loanedAt = 'Loan date cannot be in the future';
  }
  
  if (!loan.dueAt) {
    errors.dueAt = 'Due date is required';
  } else if (new Date(loan.dueAt) <= new Date(loan.loanedAt)) {
    errors.dueAt = 'Due date must be after loan date';
  }
  
  return errors;
};

// Check if form is valid
export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
};
