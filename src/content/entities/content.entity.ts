import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FileResource } from "../../file-resource/entities/file-resource.entity";

@Entity({ name: "content" })
export class Content {
  @PrimaryGeneratedColumn({ name: "content_id" })
  contentId: number;

  // content 1- n file resource
  @OneToMany(() => FileResource, x => x.content)
  fileResources: FileResource[];
}