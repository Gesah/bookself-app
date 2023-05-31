const inputBook = document.getElementById("inputBook");

const incompleteBookshelfList = document.getElementById(
  "incompleteBookshelfList"
);
const completeBookshelfList = document.getElementById(
  "completeBookshelfList"
);

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APP';

function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked ? true : false;

  const book = makeBook(bookTitle, bookAuthor, bookYear, isComplete);
  const bookObject = composeBookObject(bookTitle, bookAuthor, bookYear, isComplete);

  if (isComplete) {
    addBookToCompleted(book);
  } else {
    addBookToIncomplete(book);
  }

  updateDataToStorage(bookObject);
}

function makeBook(title, author, year, isComplete) {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = title;
  
  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = "Penulis: " + author;
  
  const bookYear = document.createElement("p");
  bookYear.innerText = "Tahun: " + year;
  
  const bookAction = document.createElement("div");
  bookAction.classList.add("action");

  const bookItem = document.createElement("article");
  bookItem.classList.add("book_item");
  bookItem.append(bookTitle, bookAuthor, bookYear, bookAction);

  if (isComplete) {
    bookAction.append(createUnreadButton(), createDeleteButton());
  } else {
    bookAction.append(createReadButton(), createDeleteButton());
  }

  return bookItem;
}

function searchBook() {
  const input = document.getElementById("searchBookBtn").value.toLowerCase();
  const bookItems = document.querySelectorAll(".book_item");
  bookItems.forEach((bookItem) => {
    const title = bookItem.querySelector("h3").innerText.toLowerCase();
    if (title.indexOf(input) > -1) {
      bookItem.style.display = "";
    } else {
      bookItem.style.display = "none";
    }
  });
}

function createButton(buttonClass, buttonText, eventListener) {
  const button = document.createElement("button");
  button.classList.add(buttonClass);
  button.innerText = buttonText;
  button.addEventListener("click", function (event) {
    eventListener(event);
  });

  return button;
}

function createReadButton() {
  return createButton("green", "Selesai dibaca", function (event) {
    addBookToCompleted(event.target.parentElement.parentElement);
  });
}

function createUnreadButton() {
  return createButton("green", "Belum selesai dibaca", function (event) {
    addBookToIncomplete(event.target.parentElement.parentElement);
  });
}

function createDeleteButton() {
  return createButton("red", "Hapus buku", function (event) {
    const bookElement = event.target.parentElement.parentElement;
    removeBookFromStorage(bookElement);
    bookElement.remove();
  });
}

function addBookToIncomplete(bookElement) {
  incompleteBookshelfList.append(bookElement);
  const bookObject = getBookObject(bookElement);
  bookObject.isComplete = false;
  updateDataToStorage(bookObject);
}

function addBookToCompleted(bookElement) {
  completeBookshelfList.append(bookElement);
  const bookObject = getBookObject(bookElement);
  bookObject.isComplete = true;
  updateDataToStorage(bookObject);
}

function getBookObject(bookElement) {
  const bookTitle = bookElement.querySelector(".book_item > h3").innerText;
  const bookAuthor = bookElement.querySelector(".book_item > p").innerText.split(": ")[1];
  const bookYear = bookElement.querySelector(".book_item > p:nth-of-type(2)").innerText.split(": ")[1];
  const bookIsComplete = bookElement.querySelector(".action > .green").classList.contains("read");
  const bookObject = composeBookObject(bookTitle, bookAuthor, bookYear, bookIsComplete);
  bookObject.id = bookElement.getAttribute("data-book-id");
  return bookObject;
}

function composeBookObject(bookTitle, bookAuthor, bookYear, isComplete) {
  return {
    id: +new Date(),
    title: bookTitle,
    author: bookAuthor,
    year: bookYear,
    isComplete: isComplete || false,
  };
}

function updateDataToStorage() {
  const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
  const completeBookshelfList = document.getElementById("completeBookshelfList");

  let incompleteBooks = [];
  let completeBooks = [];

  for (book of incompleteBookshelfList.querySelectorAll(".book_item")) {
    incompleteBooks.push(getBookObject(book));
  }

  for (book of completeBookshelfList.querySelectorAll(".book_item")) {
    completeBooks.push(getBookObject(book));
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      incomplete: incompleteBooks,
      complete: completeBooks,
    })
  );

  document.dispatchEvent(new Event(SAVED_EVENT));
}


function loadDataFromStorage() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    const data = JSON.parse(storedData);
    const incompleteBooks = data.incomplete || [];
    const completeBooks = data.complete || [];

    incompleteBooks.forEach((book) => {
      const bookItem = makeBook(book.title, book.author, book.year, false);
      bookItem.setAttribute("data-book-id", book.id);
      addBookToIncomplete(bookItem);
    });

    completeBooks.forEach((book) => {
      const bookItem = makeBook(book.title, book.author, book.year, true);
      bookItem.setAttribute("data-book-id", book.id);
      addBookToCompleted(bookItem);
    });    
  }
}

function removeBookFromStorage(bookElement) {
  const bookObject = getBookObject(bookElement);
  const storageData = JSON.parse(localStorage.getItem(STORAGE_KEY));
  
  let incompleteBooks = storageData.incomplete || [];
  let completeBooks = storageData.complete || [];

  if (bookObject.isComplete) {
    completeBooks = completeBooks.filter(book => book.id !== bookObject.id);
  } else {
    incompleteBooks = incompleteBooks.filter(book => book.id !== bookObject.id);
  }

  if (bookObject.isComplete) {
    incompleteBooks = incompleteBooks.filter(book => book.id !== bookObject.id);
  } else {
    completeBooks = completeBooks.filter(book => book.id !== bookObject.id);
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      incomplete: incompleteBooks,
      complete: completeBooks
    })
  );

}

  
  function findBookIndex(bookId) {
    let storedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    for (let i = 0; i < storedData.length; i++) {
      if (storedData[i].id === bookId) {
        return i;
      }
    }
    return -1;
  }

inputBook.addEventListener("submit", function (event) {
event.preventDefault();
addBook();
});

document.addEventListener("DOMContentLoaded", function () {
  loadDataFromStorage();
});

const searchBookBtn = document.getElementById("searchBookBtn");
searchBookBtn.addEventListener("click", function () {
  searchBook();
});
