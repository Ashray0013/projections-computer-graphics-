# 3D Projections Visualizer

An interactive 2D Canvas visualizer for **Computer Graphics Projections** built with HTML5, JavaScript, and CSS. This tool demonstrates and compares various 3D-to-2D projection algorithms—including **Orthographic Parallel**, **Oblique Parallel**, **Standard Perspective**, and **Arbitrary Plane** projections—based on general graphics formulas.

---

##  Features

* **Interactive Control Panel:**
* Toggle between projection modes in real time.
* Adjust plane offsets $(x_0, y_0, z_0)$ and plane normal vectors $(l, m, n)$.


* Control object rotation speed and pause/resume animation.


* **Supported Projection Modes:**
* **Perspective Projection:** Demonstrates foreshortening where points are divided by depth ($z$).


* **Orthographic Parallel:** Directly projects 3D coordinates onto the 2D plane without perspective scaling.


* **Oblique Parallel:** Skews the projection along a custom projection vector $(l, m, n)$.


* **Arbitrary Plane Projection:** Applies origin translation and spherical axis alignment to project a 3D object onto any arbitrarily rotated plane $(x_0, y_0, z_0)$ with normal vector $(l, m, n)$.





---

##  Installation & Setup

1. Clone or download the repository to your local machine.
2. Ensure you have the following file structure:
```text
├── index.html
├── index.js
└── penger.js (for points )

```


3. Open `index.html` directly in any modern web browser (Chrome, Firefox, Edge, Safari). No web server or build tools required!

---

## 📐 Mathematical Overview

* **Parallel (Orthographic):**

$$x' = x, \quad y' = y$$



* **Oblique Projection:**

$$x' = x - \left(\frac{l}{n}\right)z, \quad y' = y - \left(\frac{m}{n}\right)z$$



* **Perspective Projection:**

$$x' = \frac{x}{z}, \quad y' = \frac{y}{z}$$


---
