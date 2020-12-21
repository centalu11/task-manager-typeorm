import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    description: string;

    @Column()
    completed: boolean;

    @Column()
    @CreateDateColumn()
    created_at: Date;

    @Column()
    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => User, user => user.tasks, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'user_id' })
    user: User;
}