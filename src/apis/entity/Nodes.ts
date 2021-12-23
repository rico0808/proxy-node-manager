import { EntityModel } from "@midwayjs/orm";
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@EntityModel("Nodes")
export class Nodes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, comment: "节点名字" })
  name: string;

  @Column({ length: 64, unique: true, comment: "节点地址" })
  ddns: string;

  @Column({ default: "6677", length: 5, comment: "端口" })
  port: string;

  @Column({ default: 0, comment: "在线人数" })
  online: number;

  @Column({ type: "bigint", default: 0, comment: "消耗流量" })
  traffic: number;

  @Column({ type: "tinyint", default: 1, comment: "状态" })
  status: number;

  @Column({ type: "datetime", nullable: true, comment: "最后在线" })
  report: string;

  @CreateDateColumn({ type: "datetime" })
  createAt: string;
  @UpdateDateColumn({ type: "datetime" })
  updateAt: string;
}
