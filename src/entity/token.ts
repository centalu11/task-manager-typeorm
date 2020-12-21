import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Token {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;

    @ManyToOne(() => User, user => user.tokens, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'user_id' })
    user: User;
}