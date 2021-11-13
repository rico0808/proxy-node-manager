import { EntityModel } from "@midwayjs/orm";
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@EntityModel("Goods")
export class Goods {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, comment: "商品名字" })
  name: string;

  @Column({ length: 64, unique: true, comment: "SKU编号" })
  sku: string;

  @Column({ default: 0, comment: "销量" })
  sales: number;

  @Column({ type: "tinyint", default: 1, comment: "状态" })
  status: number;

  @CreateDateColumn({ type: "datetime" })
  createAt: string;
  @UpdateDateColumn({ type: "datetime" })
  updateAt: string;
}
