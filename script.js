const API_KEY = "30a0be0a1068f843d9b4ef1c33f7553e";

let unit = 'C';
let cache = null;

const $ = id => document.getElementById(id);

function iconKey(c){

  const t = (c || '').toLowerCase();

  if(t.includes('storm')) return '⛈️';
  if(t.includes('rain')) return '🌧️';
  if(t.includes('cloud')) return '☁️';
  if(t.includes('snow')) return '❄️';
  if(t.includes('fog')) return '🌫️';

  return '☀️';
}

function showErr(msg){

  $('err').textContent = msg;

  $('err').classList.add('show');
}

function hideErr(){

  $('err').classList.remove('show');
}

function temp(v){

  return unit === 'C'
    ? Math.round(v) + '°'
    : Math.round(v * 9/5 + 32) + '°';
}

function render(d){

  cache = d;

  $('card').classList.add('show');

  $('dCity').textContent = d.city;

  $('dCountry').textContent = d.country;

  $('dTime').textContent =
    d.localTime + ' · ' + d.date;

  $('dCond').textContent =
    d.condition;

  $('dEmoji').textContent =
    iconKey(d.condition);

  $('dTemp').textContent =
    temp(d.tempC);

  $('dHum').textContent =
    d.humidity + '%';

  $('dWind').textContent =
    d.windKph + ' km/h';

  $('dVis').textContent =
    d.visibilityKm + ' km';

  $('dFeel').textContent =
    temp(d.feelsLikeC);

  $('dHi').textContent =
    temp(d.highC);

  $('dLo').textContent =
    temp(d.lowC);

  const strip = $('strip');

  strip.innerHTML = '';

  d.forecast.forEach(f => {

    strip.innerHTML += `
      <div class="fc">

        <div class="fc-day">
          ${f.day}
        </div>

        <div style="font-size:28px">
          ${iconKey(f.condition)}
        </div>

        <div class="fc-hi">
          ${temp(f.highC)}
        </div>

        <div class="fc-lo">
          ${temp(f.lowC)}
        </div>

      </div>
    `;
  });

  strip.classList.add('show');
}

async function go(){

  const city = $('inp').value.trim();

  if(!city) return;

  hideErr();

  $('loader').classList.add('show');

  $('btn').disabled = true;

  try{

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    if(!res.ok){

      throw new Error('City not found');
    }

    const weather = await res.json();

    const res2 = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );

    const forecastData = await res2.json();

    const forecast = forecastData.list
      .filter((x,i)=>i%8===0)
      .slice(0,5)
      .map(x => ({

        day:new Date(x.dt_txt)
          .toLocaleDateString(
            'en-US',
            {weekday:'short'}
          ),

        condition:x.weather[0].main,

        highC:x.main.temp_max,

        lowC:x.main.temp_min
      }));

    render({

      city:weather.name,

      country:weather.sys.country,

      localTime:new Date()
        .toLocaleTimeString(),

      date:new Date()
        .toDateString(),

      tempC:weather.main.temp,

      feelsLikeC:weather.main.feels_like,

      highC:weather.main.temp_max,

      lowC:weather.main.temp_min,

      humidity:weather.main.humidity,

      windKph:Math.round(
        weather.wind.speed * 3.6
      ),

      visibilityKm:
        weather.visibility / 1000,

      condition:
        weather.weather[0].main,

      forecast
    });

  }catch(err){

    console.log(err);

    showErr('⚠ Weather fetch failed');
  }

  finally{

    $('loader').classList.remove('show');

    $('btn').disabled = false;
  }
}

function pick(name){

  $('inp').value = name;

  go();
}

function setUnit(u){

  unit = u;

  $('btnC').classList.toggle(
    'on',
    u === 'C'
  );

  $('btnF').classList.toggle(
    'on',
    u === 'F'
  );

  if(cache) render(cache);
}

$('inp').addEventListener(
  'keydown',
  e => {

    if(e.key === 'Enter'){

      go();
    }
  }
);

pick('New Delhi');

