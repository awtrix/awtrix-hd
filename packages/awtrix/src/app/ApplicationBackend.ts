import { LifecycleApplication, ApplicationConfig } from '@/types/Application'
import { omit } from 'lodash'
import { Namespace } from 'socket.io'

type ApplicationConfigWithIdentifier = ApplicationConfig & {
  id: string
}

export default class ApplicationBackend {
  /**
   * TODO
   */
  ready: boolean = true

  /**
   * TODO
   */
  locked: boolean = false

  /**
   * TODO
   */
  active: boolean = true

  /**
   * TODO
   *
   * @param config
   */
  constructor(public config: ApplicationConfigWithIdentifier, public userConfig: any, public io: Namespace) {
  }

  /**
   * TODO
   *
   * TODO: Add do not overwrite note or wrap the Application Backend
   */
  get displayLength (): number {
    if (this.userConfig.displayLength) return this.userConfig.displayLength
    return this.config.awtrix.defaultDisplayLength || 15000
  }

  asLifecycleApplication(): LifecycleApplication {
    return {
      id: this.config.id,
      name: this.config.name!,
      version: this.config.version!,
      config: omit(this.config, ['name', 'version', 'id']),
      lifecycle: {
        ready: this.ready,
        locked: this.locked,
      },
    }
  }

  /**
   * TODO
   */
  register() { }
}
