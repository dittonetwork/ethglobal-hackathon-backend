import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  // Получение всех событий
  async findAll(): Promise<Event[]> {
    return this.eventRepository.find();
  }

  // Получение события по ID
  async findOne(id: number): Promise<Event | undefined> {
    return this.eventRepository.findOne({ where: { id } });
  }

  // Создание нового события
  async create(eventData: Partial<Event>): Promise<Event> {
    const event = this.eventRepository.create(eventData);
    return this.eventRepository.save(event);
  }

  // Обновление существующего события
  async update(id: number, eventData: Partial<Event>): Promise<Event> {
    await this.eventRepository.update(id, eventData);
    return this.eventRepository.findOne({ where: { id } });
  }

  // Удаление события
  async remove(id: number): Promise<void> {
    await this.eventRepository.delete(id);
  }
}
