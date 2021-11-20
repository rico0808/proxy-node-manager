import { EntityModel } from "@midwayjs/orm";
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@EntityModel("Users")
export class Users {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ length: 32, unique: true, comment: "购物网站ID" })
  tb: string;
  @Column({ length: 32, unique: true, comment: "连接账号" })
  account: string;
  @Column({ length: 18, comment: "连接密码" })
  passwd: string;
  @Column({ type: "bigint", default: 0, comment: "总流量" })
  traffic: number;
  @Column({ type: "bigint", default: 0, comment: "已用流量" })
  used: number;
  @Column({ type: "datetime", comment: "到期时间" })
  expire: string;
  @Column({ type: "tinyint", default: 0, comment: "是否已经试用" })
  useTest: number;
  @Column({ type: "tinyint", default: 1, comment: "状态" })
  status: number;
  @Column({ type: "tinyint", default: 0, comment: "管理员" })
  isAdmin: number;

  @CreateDateColumn({ type: "datetime" })
  createAt: string;
  @UpdateDateColumn({ type: "datetime" })
  updateAt: string;
}
