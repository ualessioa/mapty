"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
// let map;
// let mapEvent;

class App {
  // we use the constructor function to start our app operations as soon as an object of our app class gets created
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    // as an addeventlistener callbackfunction newworkout this points to the dom element that is being listened so we use bind to pass the this
    form.addEventListener("submit", this._newWorkout.bind(this));

    // change input values when the user changes the type of workout
    inputType.addEventListener("change", this._toggleElevationField);
  }

  _getPosition() {
    // geolocation API browser api
    if (navigator.geolocation) {
      //this._loadMap gets passed the position as a parameter automatically because it would be handled as an event-like
      //since loadMap is a callback function it gets called by getcurrentposition and doesn't get the right this value, so we use bind
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert(`Could not get your position!`);
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, 15); // the string passed to L.map is the Id of the element where the map will be displayed

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker([41.108038978708954, 16.85307562351227])
      .addTo(this.#map)
      .bindPopup("Frankhood")
      .openPopup();

    // we cannot simply use addeventlistener to the whole map element because wouldn't get the coordinates of where we clicked, so we use a custom method of the leaflet map object
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    // render form before inserting pin into map to have the workout data
    form.classList.remove("hidden");
    //focusing on the form right after the click
    inputDistance.focus();
    // we export the mapevent to a global variable
    this.#mapEvent = mapE;
  }

  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    //event listener on the form for the submit event
    // prevents page from loading after submitting
    e.preventDefault();

    //clearing input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";
    const { lat, lng } = this.#mapEvent.latlng;

    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `running-popup`,
        })
      )
      .setPopupContent(`Workout`)
      .openPopup();
  }
}

const app = new App();
