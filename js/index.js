// Import Firebase app and database modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, update, set } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js"

// Import UUID module
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

// Firebase app settings
const appSettings = {
 databaseURL: //"Your firebase database URL"
}

// Initialize Firebase app
const app = initializeApp(appSettings)

// Get a reference to the database service
const database = getDatabase(app)

// Get a reference to the comments node in the database
const commentsInDB = ref(database, "comments")

// Get references to the input fields and card element
const textArea = document.getElementById('message')
const fromInput = document.getElementById('from')
const toInput = document.getElementById('to')
const card = document.getElementById('card')

// Add an event listener to the publish button
document.addEventListener('click', function(e){
 if (e.target.id === 'publish'){
 validateForm()
 }
})

// Validate form input fields
function validateForm() {
 const msg = textArea.value;
 const fro = fromInput.value;
 const tu = toInput.value;
 if (msg === "" || fro === "" || tu === "") {
 alert("please fill all fields");
 return false;
 } else {
 pushToDB()
 }
 }

 // Push data to the database
 function pushToDB(){
 let post = {}
 post.comment = textArea.value // Get comment from textarea input field
 post.from = fromInput.value // Get sender name from input field
 post.to = toInput.value // Get recipient name from input field
 post.likes = 0 // Initialize likes count to 0
 post.isLiked = false // Initialize isLiked flag to false
 post.uuid = uuidv4() // Generate a unique ID for the comment using UUID library
 push(commentsInDB, post) // Push comment object to the comments node in the database
 clearInputFields() // Clear input fields after submitting data to the database
 }

 // Clear input fields after submitting data to the database
 function clearInputFields(){
 textArea.value = ""
 fromInput.value = ""
 toInput.value = ""
 }

 // Listen for changes in the comments node in the database and render comments on the page
 onValue(commentsInDB, function(snapshot){
 if(snapshot.exists()){
 let itemArray = Object.entries(snapshot.val()) // Convert snapshot object into an array of key-value pairs
 clearComments() // Clear all comments on the page before rendering new ones
 for (let current of itemArray){
 let currentItem = current // Get current item in array (key-value pair)
 let currentItemID = currentItem[0] // Get ID of current item (key)
 let currentItemValue = currentItem[1] // Get value of current item (comment object)
 renderComments(currentItemValue, currentItemID) // Render comment on the page using its value and ID
 }
 isLiked(itemArray) // Listen for clicks on like buttons and update likes in the database accordingly
 }
 })

 // Render comments on the page using their values and IDs
 function renderComments(object, Ids){
 let publication = `
 <div>
 <h5 id="to-card">To ${object.to}</h5>
 <p id="message-card">${object.comment}</p>
 <div class="card-footer">
 <h5 id="from-card">From ${object.from}</h5>
 <h6 id="likes" data-like="${Ids}">${object.likes}<3</h6>
 </div>
 `
 card.innerHTML += publication // Add comment HTML element to card element on page
 }

 // Clear all comments on the page before rendering new ones
 function clearComments(){
 card.innerHTML = ""
 }

 // Listen for clicks on like buttons and update likes in the database accordingly
function isLiked(array){
  let arrayId = []
  let arrayValue = []
  for (let id of array){
  arrayId.push(id[0])
  }
  for (let value of array){
  arrayValue.push(value[1])
  }
  document.addEventListener('click',function(e){
  if(e.target.dataset.like){ // If clicked element has a data-like attribute (like button)
  const targetItemObj = arrayId.filter(function(po){ // Get the ID of the comment object that was liked
  return po === e.target.dataset.like
  })
  let index = arrayId.indexOf(targetItemObj[0]) // Get the index of the comment object in the array using its ID
  let exactLocationInDB = ref(database, `comments/${targetItemObj}`) // Get a reference to the exact location of the comment object in the database using its ID
  update(exactLocationInDB, { // Update the comment object in the database with new values for likes and isLiked flag
  isLiked: true,
  likes: arrayValue[index]["likes"]+1,
  })
  }
  })
 }