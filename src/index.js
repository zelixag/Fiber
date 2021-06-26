import React, {render, Component} from "./react"

const root = document.getElementById("root")

// const jsx = (<div>
//   <p>Hello React</p>
//   <p>Hello FIber</p>
// </div>)
// render(jsx, root)

// setTimeout(() => {
//   const jsx = (<div>
//     <p>Hello FIber</p>
//   </div>)
//   render(jsx, root)
// }, 2000);


class Creating extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '张三',
    }
  }
  render() {
    return <div>
      {this.props.title}hahhahaha{this.state.name}
      <button onClick={() => this.setState({name: "李四"})}>button</button>
      </div>
  }
}
render(<Creating title={"hello"}/>, root)
// function FnComponent(props) {
//   return <div>{props.title}FnComponent</div>
// }

// render(<FnComponent title={"hello"}/>, root)