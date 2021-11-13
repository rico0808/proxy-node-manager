import { EntityModel } from "@midwayjs/orm";
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@EntityModel("Goods")
export class Goods {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", comment: "商品名字" })
  name: string;

  @Column({ type: "varchar", length: "20", unique: true, comment: "sku编号" })
  sku: string;

  @Column({ default: 0, comment: "销量" })
  sales: number;

  @Column({ default: 0, comment: "流量大小" })
  traffic: number;

  @Column({ default: 30, comment: "有效天数" }) // 有效天数
  days: number;

  @Column({ type: "tinyint", default: 1, comment: " 状态 -1禁用 0下架 1销售" })
  status: number;

  @CreateDateColumn() // 创建时间
  createAt: Date;

  @UpdateDateColumn() // 更新时间
  updateAt: Date;
}
