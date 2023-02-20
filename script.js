"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
let id = 0;
// let map;
// let mapEvent;

class App {
  // we use the constructor function to start our app operations as soon as an object of our app class gets created
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    // as an addeventlistener callbackfunction newworkout this points to the dom element that is being listened so we use bind to pass the this

    //modifica gianni al posto di usare bind per la callback possiamo utilizzare un'arrow function che non avendo un suo this utilizzera' quello dell'app stessa
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this._newWorkout(e);
    });

    // change input values when the user changes the type of workout
    inputType.addEventListener("change", this._toggleElevationField);

    // movetopopup function implemented with an arrow function to play with the this keyword
    containerWorkouts.addEventListener("click", (e) => {
      const workoutEl = e.target.closest(".workout");
      if (!workoutEl) return;
      const workout = this.#workouts.find(
        (work) => work.id === workoutEl.dataset.id
      );
      this.#map.setView(workout.coords, 15, {
        animate: true,
        pan: {
          duration: 1,
        },
      });

      //using the public interface of the workout class
      workout.click();
      console.log(workout);
    });
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
    this.#map = L.map("map").setView(coords, 17); // the string passed to L.map is the Id of the element where the map will be displayed
    // '', {maxZoom: 20}
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

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

  _hideForm() {
    //clearing input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";
    //cheap trick
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    //will loop the array of inputs and check if everyone of them is a number
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    const isPositive = (...inputs) => inputs.every((inp) => inp > 0);

    //event listener on the form for the submit event
    // prevents page from loading after submitting
    e.preventDefault();

    // get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // check type workout and create the right object
    if (type === "running") {
      const cadence = +inputCadence.value;
      //check if data is valid with a guard clause
      if (
        !validInputs(distance, duration, cadence) ||
        !isPositive(distance, duration, cadence)
      ) {
        alert(`Inputs have to be positive numbers!`);
        return;
      }

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === "cycling") {
      const elevChange = +inputElevation.value;
      //check if data is valid with a guard clause
      if (
        !validInputs(distance, duration, elevChange) ||
        !isPositive(distance, duration)
      ) {
        alert(`Inputs have to be positive numbers!`);
        return;
      }

      workout = new Cycling([lat, lng], distance, duration, elevChange);
    }

    this.#workouts.push(workout);

    this._hideForm();

    this._renderWorkoutMarker(workout);

    this._renderWorkout(workout);
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? `🏃‍♂️` : `🚴‍♀️`} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === "running" ? `🏃‍♂️` : `🚴‍♀️`
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if (workout.type === "running") {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    }

    if (workout.type === "cycling") {
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevChange}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }

    form.insertAdjacentHTML("afterend", html);
  }
}

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // km
    this.duration = duration; // mins
  }

  click() {
    this.clicks++;
  }

  _setDescription() {
    // prettier-ignore
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = "running";

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = (this.duration / this.distance).toFixed(2);
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevChange) {
    super(coords, distance, duration);
    this.elevChange = elevChange;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = (this.distance / (this.duration / 60)).toFixed(2);
    return this.speed;
  }
}

const app = new App();
