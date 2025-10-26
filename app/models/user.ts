import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['username'],
  passwordColumnName: 'userpassword',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true, columnName: 'userId' })
  public userId!: number

  @column({ columnName: 'username' })
  public username!: string

  @column({ serializeAs: null, columnName: 'userpassword' })
  public userpassword!: string
}
