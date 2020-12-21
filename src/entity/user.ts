import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Task } from "./task";
import { Token } from "./token";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
        unique: true
    })
    email: string;

    @Column({
        select: false
    })
    password: string;

    @Column()
    age: number;

    @Column()
    @CreateDateColumn()
    created_at: Date;

    @Column()
    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Token, token => token.user)
    tokens: Token[];

    @OneToMany(() => Task, task => task.user)
    tasks: Task[];
}