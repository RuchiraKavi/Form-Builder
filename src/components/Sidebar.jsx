import { Link, useLocation } from "react-router-dom";
import { FaHome, FaWpforms, FaPlus, FaChartBar, FaEye, FaCog } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const { pathname } = useLocation();
  const [activePath, setActivePath] = useState("/");

  // Sync active item with current URL on page load / route change
  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const menuItems = [
    { name: "Dashboard", path: "", icon: <FaHome /> },
    { name: "Forms", path: "/forms", icon: <FaWpforms /> },
    { name: "Form Builder", path: "/forms/create", icon: <FaPlus /> },
    { name: "Submissions", path: "/submissions", icon: <FaChartBar /> },
    { name: "Preview", path: "/preview", icon: <FaEye /> },
    { name: "Settings", path: "/settings", icon: <FaCog /> },
  ];

  return (
    <aside className="sidebar">
      <h1 className="logo">FormBuilder</h1>
      <div className="sidebar-header">Manage your forms</div>
      <hr />
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={activePath === item.path ? "active" : ""}
              onClick={() => setActivePath(item.path)}
            >
              <Link to={item.path}>
                <span className="icon">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
