import { RvdComponentNode, RvdNode } from '@atom-iq/core'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

interface SwitchProps {
  children: RvdComponentNode[]
}

export function Switch({ children }: SwitchProps, { router, route }): Observable<RvdComponentNode> {
  const basePath: string = route() || '/'

  return switchMap((currentLocation: string) => {
    for (let i = 0, l = children.length; i < l; ++i) {
      const component = children[i]
      if (component.type === Route) {
        const routePath =
          basePath +
          (component.props.path.startWith('/') ? component.props.path : '/' + component.props.path)
        if (currentLocation.includes(routePath)) {
          return component
        }
      }
    }
    return null
  })(router().location$)
}

Switch.useMiddlewares = ['route', 'router']

export function Route({ path, children }, { route }): RvdNode | Observable<RvdNode> {
  route(path)

  return children
}

Route.useMiddlewares = ['route']

export function Link({ to, children }, { router }) {
  return <a onClick={() => router(to)}>{children}</a>
}

Link.useMiddlewares = ['router']
