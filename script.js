let weather = {
    openWeatherApiKey: "a64234bcd09f842da1155c249d3effbe",
    unsplashApiKey: "eIFCnltIB-s-AIznSYYcbOYRuBGto3SQ1QgDbIC8ZZ4", 

    fetchWeather: function (city) {
      fetch(
        "https://api.openweathermap.org/data/2.5/weather?q=" +
          city +
          "&units=metric&appid=" +
          this.openWeatherApiKey
      )
        .then((response) => {
          if (!response.ok) {
            alert("No weather found.");
            throw new Error("No weather found.");
          }
          return response.json();
        })
        .then((data) => this.displayWeather(data));
    },

    displayWeather: function (data) {
      const { name } = data;
      const { icon, description } = data.weather[0];
      const { temp, humidity } = data.main;
      const { speed } = data.wind;

      document.querySelector(".city").innerText = "Weather in " + name;
      document.querySelector(".icon").src = "https://openweathermap.org/img/wn/" + icon + ".png";
      document.querySelector(".description").innerText = description;
      document.querySelector(".temp").innerText = temp + "°C";
      document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
      document.querySelector(".wind").innerText = "Wind speed: " + speed + " km/h";
      document.querySelector(".weather").classList.remove("loading");
      
      this.fetchCityImage(name);
    },

    fetchCityImage: function (city) {
      const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(city)}&per_page=1&orientation=landscape&client_id=${this.unsplashApiKey}`;

      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          const bgDiv = document.querySelector('.bg');
          if (data.results && data.results.length > 0) {
            // If we found an image, use it
            const imageUrl = data.results[0].urls.regular;
            bgDiv.style.backgroundImage = `url('${imageUrl}')`;
          } else {
            // If no image was found, use a generic fallback
            bgDiv.style.backgroundImage = "url('https://picsum.photos/1600/900')";
          }
        })
        .catch(err => {
            console.error("Failed to fetch image:", err);
            // If the API call fails, use a generic fallback
            document.querySelector('.bg').style.backgroundImage = "url('https://picsum.photos/1600/900')";
        });
    },

    search: function () {
      this.fetchWeather(document.querySelector(".search-bar").value);
    },
  };

  let geocode = {
    openCageApiKey: '19cb3275d0fe4535beb6f46287ae84d6',
    
    reverseGeocode: function (latitude, longitude){
      var api_url = 'https://api.opencagedata.com/geocode/v1/json'
    
      var request_url = api_url
        + '?'
        + 'key=' + this.openCageApiKey
        + '&q=' + encodeURIComponent(latitude + ',' + longitude)
        + '&pretty=1'
        + '&no_annotations=1';
    
      var request = new XMLHttpRequest();
      request.open('GET', request_url, true);
    
      request.onload = function() {
        if (request.status === 200){
          var data = JSON.parse(request.responseText);
          const components = data.results[0].components;
          const locationName = components.city || components.town || components.state;
          
          if (locationName) {
            weather.fetchWeather(locationName);
          } else {
            weather.fetchWeather("Mumbai");
          }
        } else {
          console.log("Error fetching location from coordinates");
        }
      };
      request.send();
    },

    getLocation: function(){
      function success(data){
        geocode.reverseGeocode(data.coords.latitude, data.coords.longitude);
      }
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(success, () => {
          // If user denies location, fetch a default city
          weather.fetchWeather("Mumbai");
        });
      }
      else{
        weather.fetchWeather("Mumbai");
      }
    }
  };

  document.querySelector(".search button").addEventListener("click", function () {
    weather.search();
  });
  
  document.querySelector(".search-bar").addEventListener("keyup", function (event) {
      if (event.key == "Enter") {
        weather.search();
      }
    });
  
geocode.getLocation();
