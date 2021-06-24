import React, {render, Component} from "./react"

const root = document.getElementById("root")

const jsx = (<div>
  <p>Hello React</p>
  <p>我是同级子节点</p>
</div>)

// render(jsx, root)

class Creating extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return <div>hahhahaha</div>
  }
}

render(<Creating/>, root)