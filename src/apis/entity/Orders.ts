import { EntityModel } from "@midwayjs/orm";
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@EntityModel("Orders")
export class Orders {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: "用户id" })
  uid: number;

  @Column({ comment: "淘宝id" })
  tb: string;

  @Column({ length: "20", comment: "订单来源" })
  source: string;

  @Column({ type: "varchar", length: "20", unique: true, comment: "订单号" })
  tid: string;

  @Column({ type: "decimal", default: 0.0, scale: 2, comment: "付款金额" })
  payment: number;

  @Column({ type: "tinyint", default: 0, comment: "订单状态 0未知 1已付款 2已发货 -1退款" })
  status: number;

  @Column({ type: "datetime", comment: "购买时间" })
  buyTime: string;

  @Column({ type: "text", comment: "商品详情" })
  product: string;

  @CreateDateColumn({ type: "datetime" }) // 创建时间
  createAt: string;
  @UpdateDateColumn({ type: "datetime" }) // 更新时间
  updateAt: string;
}
