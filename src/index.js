import React, {render} from "./react"

const root = document.getElementById("root")

const jsx = (<div>
  <p>Hello React</p>
</div>)

console.log(jsx)

render(jsx, root)