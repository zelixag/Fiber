import React, {render, Component} from "./react"

const root = document.getElementById("root")

const jsx = (<div>
  <p>Hello React</p>
  <p>Hello FIber</p>
</div>)
render(jsx, root)

setTimeout(() => {
  const jsx = (<div>
    <p>奥利给</p>
    <p>Hello FIber</p>
  </div>)
  render(jsx, root)
}, 2000);


// class Creating extends Component {
//   constructor(props) {
//     super(props)
//   }
//   render() {
//     return <div>{this.props.title}hahhahaha</div>
//   }
// }
// render(<Creating title={"hello"}/>, root)
// function FnComponent(props) {
//   return <div>{props.title}FnComponent</div>
// }

// render(<FnComponent title={"hello"}/>, root)