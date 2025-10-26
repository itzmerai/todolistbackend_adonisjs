import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Task extends BaseModel {
  @column({ isPrimary: true, columnName: 'taskId' })
  public taskId!: number

  @column({ columnName: 'taskname' })
  public taskname!: string

  @column({ columnName: 'taskdescription' })
  public taskdescription!: string

  @column({ columnName: 'userID' })
  public userID!: number

  @belongsTo(() => User, {
    foreignKey: 'userID',
    localKey: 'userId'
  })
  public user!: BelongsTo<typeof User>
}
