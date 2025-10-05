import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Stats {
  presupuestos: number;
  pedidos: number;
  total_ventas: number;
}

interface Presupuesto {
  id: number;
  cliente: string;
  estado: string;
  total: number;
  fecha: string;
  items: any[];
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('app-clean');
  private http = inject(HttpClient);

  // Signals para estado
  healthStatus = signal<string>('');
  stats = signal<Stats | null>(null);
  statsError = signal<string>('');
  presupuestos = signal<Presupuesto[]>([]);
  presupuestosError = signal<string>('');
  createMessage = signal<string>('');

  ngOnInit(): void {
    this.testHealth();
  }

  testHealth(): void {
    this.http.get('/health', { responseType: 'text' }).subscribe({
      next: (res) => this.healthStatus.set('✅ Backend conectado: ' + res),
      error: (err) => this.healthStatus.set('❌ Error de conexión: ' + err.message),
    });
  }

  loadStats(): void {
    this.statsError.set('');
    this.http.get<Stats>('/stats').subscribe({
      next: (data) => {
        this.stats.set(data);
        this.statsError.set('');
      },
      error: (err) => {
        this.statsError.set('Error al cargar estadísticas: ' + err.message);
        this.stats.set(null);
      },
    });
  }

  loadPresupuestos(): void {
    this.presupuestosError.set('');
    this.http.get<Presupuesto[]>('/presupuestos').subscribe({
      next: (data) => {
        this.presupuestos.set(data);
        this.presupuestosError.set('');
      },
      error: (err) => {
        this.presupuestosError.set('Error al cargar presupuestos: ' + err.message);
        this.presupuestos.set([]);
      },
    });
  }

  createTestPresupuesto(): void {
    const testData = {
      cliente: 'Cliente Prueba Angular',
      vehiculo: 'Test Vehicle',
      items: [{ descripcion: 'Cambio de aceite', cantidad: 1, precio: 50 }],
    };

    this.http.post('/presupuestos', testData).subscribe({
      next: (result) => {
        this.createMessage.set('✅ Presupuesto creado con éxito');
        this.loadPresupuestos(); // Recargar la lista
      },
      error: (err) => {
        this.createMessage.set('❌ Error al crear: ' + err.message);
      },
    });
  }
}
