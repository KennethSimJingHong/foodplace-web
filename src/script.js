'use strict';

const form = document.querySelector(".form");
const containerPlaces = document.querySelector(".places");
const inputCategory = document.querySelector('.form__input--category');
const inputName = document.querySelector('.form__input--name');
const inputComment = document.querySelector('.form__input--comment');
const inputRate = document.querySelector('.form__input--rate');
const inputSort = document.querySelector(".container__sort--option");

class Place{
    id = (Date.now() + '').slice(-10);

    constructor(coords, name, comment, rate, category){
        this.coords = coords;
        this.name = name;
        this.comment = comment;
        this.rate = rate;
        this.category = category;
    }

}

class App{
    #map;
    #mapEvent;
    #markers = [];
    #places = [
        new Place([3.1321683, 101.6710431], "myBurgerLab", "The beef patty is on the soft side, but not too mushy. The chips are real skin on potato chips that are cut not too thinly. Loving it!", 4, "western")
    ];

    constructor(){
        this._getPosition();
        form.addEventListener("submit", this._newPlace.bind(this));
        containerPlaces.addEventListener("click", this._moveToPopup.bind(this));
        inputSort.addEventListener("change", this._controlHandlerSorting.bind(this));
    }

    _getPosition(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){});
        }
    }

    _loadMap(position){
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        const coords = [latitude, longitude];

        this.#map = L.map('map').setView(coords, 15);

        L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
    
        this.#map.on("click", this._showForm.bind(this));

        this._getData();
    }

    _showForm(e){
        this.#mapEvent = e;
        inputName.focus();
    }

    _newPlace(e){
        const isEmpty = (...inputs) => inputs.some(input => !input || input.length === 0);
    
        e.preventDefault();

        // get data
        const category = inputCategory.value;
        const name = inputName.value;
        const comment = inputComment.value;
        const rate = +inputRate.value;
        if(!this.#mapEvent) return alert("Be sure you have select a place!");
        const {lat, lng} = this.#mapEvent.latlng;
        
        // check if it is valid
        if(isEmpty(name, comment)) return alert("Input should not be empty!");

        // valid then create place object
        const place = new Place([lat,lng], name, comment, rate, category);
        this.#places.push(place);

        // render place as marker
        this._renderPlaceMarker(place);
        
        // render place on list
        this._renderPlace(place);

        // clear input
        this._hideForm();
    }

    _renderPlaceMarker(place){
        const marker = L.marker(place.coords).addTo(this.#map)
        .bindPopup(L.popup({maxWidth:250, minWidth: 100}))
        .setPopupContent(`${place.name}`)
        .openPopup();

        this.#markers.push(marker);
    }

    _renderPlace(place){
        const placeRating = num => {
            let string = "";
            for(let x = 0; x < num; x++){
                string += '⭐';
            }
            return string;
        }

        const markup = `
            <li class="place" data-id="${place.id}">
                <h2 class="place__title">${place.name}</h2>
                <div class="place__details">
                    <div class="place__details--rating">${placeRating(place.rate)}</div>
                    <div class="place__details--category">${place.category}</div>
                    <div class="place__details--comment">${place.comment}</div>
                </div>
                <button class="place__btn--delete" onclick="app._deleteData(this)">Remove</button>
            </li>
        `;

        containerPlaces.insertAdjacentHTML("afterbegin", markup);
    }

    _hideForm(){
        inputName.value = inputComment.value = "";
        inputRate.value = 1;
        inputCategory.selectedIndex = 0;

    }

    _moveToPopup(e){
        const placeEl = e.target.closest(".place");
        if(!placeEl) return;
        const place = this.#places.find(pl => pl.id === placeEl.dataset.id);
        if(!place) return;
        this.#map.setView(place.coords, 15, {
            animate:true,
            pan:{
                duration:1
            }
        });
    }

    _getData(){
        this.#places.forEach(place => {
            this._renderPlaceMarker(place);
            this._renderPlace(place);
        })
    }

    _deleteData(e){
        const placeEl = e.parentElement.closest(".place");
        if(!placeEl) return;
        
        // get removed data
        const removedPlace = this.#places.filter(place => place.id === placeEl.dataset.id);

        // remove place from array
        this.#places = this.#places.filter(place => place.id !== placeEl.dataset.id);

        // remove marker
        const mark = this.#markers.find(marker => marker._latlng.lat === removedPlace[0].coords[0] && marker._latlng.lng === removedPlace[0].coords[1]);
        this.#map.removeLayer(mark);

        // remove place from view list
        placeEl.remove();
    }

    _controlHandlerSorting(e){
        const value = e.target.value;
        containerPlaces.innerHTML = "";

        if(value === "default")
        this.#places.forEach(place => {
            this._renderPlace(place);
        })

        if(value === "rating"){
            const unsortedArray = [...this.#places];
            unsortedArray.sort((a,b) => a.rate - b.rate).forEach(place => {
                this._renderPlace(place);
            })
        }
        
    }
    
}

const app = new App();






