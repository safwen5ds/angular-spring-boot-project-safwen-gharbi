import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DocumentService } from '../services/document.service';
import { Document } from '../shared/models/document.model';
import { interval } from 'rxjs';
import { fetchWeatherApi } from 'openmeteo';

@Component({
  selector: 'app-navbar-user',
  templateUrl: './navbar-user.component.html',
  styleUrls: ['./navbar-user.component.css']
})
export class NavbarUserComponent implements OnInit, OnDestroy {
  userName: string = '';
  userPhoto: string = '';
  currentDate: Date = new Date();
  currentTime: Date = new Date();
  weatherInfo: string = 'Loading...';
  private timeInterval: any;
  userEmail: string = '';
  showChatbot: boolean = false;
  documents: Document[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.startTimeUpdate();
    this.loadWeather();
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private loadUserInfo(): void {
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.userName = localStorage.getItem('userName') || this.userEmail.split('@')[0];
    this.userPhoto = localStorage.getItem('userPhoto') || 'assets/default-avatar.svg';
  }

  private startTimeUpdate(): void {
    this.timeInterval = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });
  }

  private async loadWeather(): Promise<void> {
    const params = {
      latitude: 36.828,
      longitude: 10.181,
      hourly: "temperature_2m",
      timezone: "auto"
    };

    try {
      const responses = await fetchWeatherApi("https://api.open-meteo.com/v1/forecast", params);
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

  private loadDocuments(): void {
    this.documentService.getDocuments().subscribe({
      next: (documents) => {
        this.documents = documents;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
      }
    });
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleChatbot(): void {
    this.showChatbot = !this.showChatbot;
  }
}