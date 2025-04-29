import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { fetchWeatherApi } from 'openmeteo';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  userEmail: string = '';
  userName: string = '';
  userPhoto: string = '';
  isAdmin: boolean = false;
  currentDate: Date = new Date();
  currentTime: Date = new Date();
  weatherInfo: string = 'Loading...';
  private timeInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.userName = localStorage.getItem('userName') || this.userEmail.split('@')[0];
    this.userPhoto = localStorage.getItem('userPhoto') || 'assets/default-avatar.svg';
    this.isAdmin = this.authService.isAdmin();

    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);

    this.getWeather();
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private async getWeather(): Promise<void> {
    const params = {
      "latitude": 36.828,
      "longitude": 10.181,
      "hourly": "temperature_2m",
      "timezone": "auto"
    };
    const url = "https://api.open-meteo.com/v1/forecast";

    try {
      const responses = await fetchWeatherApi(url, params);
      const response = responses[0];

      const range = (start: number, stop: number, step: number) =>
        Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

      const utcOffsetSeconds = response.utcOffsetSeconds();
      const hourly = response.hourly()!;

      const weatherData = {
        hourly: {
          time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
            (t) => new Date((t + utcOffsetSeconds) * 1000)
          ),
          temperature2m: hourly.variables(0)!.valuesArray()!,
        },
      };

      const currentHour = new Date().getHours();
      if (weatherData.hourly.temperature2m.length > currentHour) {
        const currentTemp = weatherData.hourly.temperature2m[currentHour];
        this.weatherInfo = `${currentTemp.toFixed(1)}°C`;
      } else {
        this.weatherInfo = 'Weather data unavailable';
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      this.weatherInfo = 'Weather data unavailable';
    }
  }

  logout() {
    this.authService.logout();
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
} 