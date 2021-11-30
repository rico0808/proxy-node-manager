import { EntityModel } from "@midwayjs/orm";
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@EntityModel("Notices")
export class Notices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: true, comment: "标题" })
  title: string;

  @Column({ type: "text", comment: "内容" })
  content: string;

  @Column({ length: 128, comment: "类型" })
  type: string;

  @Column({ type: "tinyint", default: 1, comment: "状态" })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  createAt: string;
  @UpdateDateColumn({ type: "datetime" })
  updateAt: string;
}
