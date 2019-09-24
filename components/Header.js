import React, { Component } from "react";
import Link from "next/link";
import appConfig from "../app.json";
const enhanceWithClickOutside = require("react-click-outside");
import { withRouter } from "next/router";
import cookie from "cookie";
import redirect from "../libs/redirect";
import { ApolloConsumer, Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import { handleError } from "../libs/errors";
import { addNotification, clearNotifications } from "./App";

const isPathnameAndLinkMatch = (router, link) =>
  link.indexOf(router.pathname) >= 0;

const composeUrl = ({ pathname, query }) => {
  let path = pathname + "?";
  Object.keys(query).forEach(q => {
    path += `${q}=${query[q]}&`;
  });
  return path;
};

const currentUserDontHavePrivilege = privileges => ({ currentUser }) => {
  // console.log("currentUser", currentUser);
  if (!currentUser || !currentUser._id) return true;
  else if (currentUser.role) {
    return !privileges.some(v => currentUser.role.privileges.includes(v));
  } else if (
    currentUser.remoteRoles &&
    currentUser.remoteRoles.includes("schooltalkdashboard_root")
  ) {
    return false;
  }
  return true;
};

const headerMenu = [
  {
    link: "/dashboard",
    label: "Dashboard",
    icon: "tachometer-alt",
    isActive: isPathnameAndLinkMatch
  },
  {
    link: "/keyspaces",
    label: "Keyspaces",
    icon: "database",
    isActive: isPathnameAndLinkMatch
  }
  // {
  //   label: "Pengaturan",
  //   icon: "cog",
  //   isActive: router => router.pathname.indexOf("/pengaturan") === 0,
  //   subMenu: props => [
  //     {
  //       link: "/pengaturan/perusahaan",
  //       label: "Perusahaan",
  //       icon: "university",
  //       isActive: isPathnameAndLinkMatch
  //     },
  //     {
  //       link: "/pengaturan/peran",
  //       label: "Peran",
  //       icon: "star",
  //       isActive: isPathnameAndLinkMatch
  //     },
  //     {
  //       link: "/pengaturan/user",
  //       label: "User",
  //       icon: "users",
  //       isActive: isPathnameAndLinkMatch
  //     }
  //   ]
  // }
];

class Header extends Component {
  state = {
    isOpen: false
  };

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  handleLogOut = async e => {
    if (e) e.preventDefault();
    try {
      await this.props.logOut();
      await this.props.client.cache.reset();
      document.cookie = cookie.serialize("token", "", {
        maxAge: -1 // Expire the cookie immediately
      });
      addNotification({
        message: `Anda berhasil logout!`,
        level: "success"
      });
      window.location = "/logout";
      // setTimeout(() => {
      //   // redirect({}, "/");
      // }, 800);
    } catch (err) {
      handleError(err);
    }
  };

  render() {
    // console.log(this.props);
    return (
      <div>
        <div className="header py-4">
          <div className="container">
            <div className="d-flex">
              <div className="d-flex">
                <Link href="#">
                  <a className="header-brand" style={{ whiteSpace: "normal" }}>
                    <img
                      src={appConfig.appIcon}
                      className="header-brand-img"
                      alt="tabler logo"
                    />
                    {appConfig.appName}
                  </a>
                </Link>
              </div>
              <div className="d-flex order-lg-2 ml-auto">
                {/* <div className="nav-item d-none d-md-flex">
                    <a
                      href="https://github.com/tabler/tabler"
                      className="btn btn-sm btn-outline-primary"
                      target="_blank"
                    >
                      Source code
                    </a>
                  </div> */}

                {/* <NotificationDropdown /> */}

                {/* <ProfileDropdown
                  name={this.props.currentUser.username}
                  role={
                    this.props.currentUser &&
                    this.props.currentUser.Role &&
                    this.props.currentUser.Role.name
                      ? this.props.currentUser.Role.name
                      : "User"
                  }
                  image={
                    this.props.currentUser.pictureUrl
                      ? this.props.currentUser.pictureUrl
                      : "/static/images/user-dummy.jpg"
                  }
                  // image="/static/faces/female/25.jpg"
                  onLogOut={this.handleLogOut}
                /> */}
              </div>
              <a
                href="#"
                className={
                  "header-toggler d-lg-none ml-3 ml-lg-0 " +
                  (this.state.isOpen ? "" : "collapsed")
                }
                data-toggle="collapse"
                data-target="#headerMenuCollapse"
                aria-expanded={this.state.isOpen ? "true" : "false"}
                onClick={this.toggle}
              >
                <span className="header-toggler-icon" />
              </a>
            </div>
          </div>
        </div>

        <div
          className={
            "header collapse d-lg-flex p-0 " + (this.state.isOpen ? "show" : "")
          }
          id="headerMenuCollapse"
        >
          <div className="container">
            <div className="row align-items-center">
              {/* <SearchBox /> */}
              <div className="col-lg order-lg-first">
                <ul className="nav nav-tabs border-0 flex-column flex-lg-row">
                  {headerMenu.map(menu => {
                    if (menu.isHidden && menu.isHidden(this.props)) {
                      return null;
                    }
                    if (menu.subMenu) {
                      const subMenuToRender = menu
                        .subMenu(this.props)
                        .filter(s => !s.isHidden || !s.isHidden(this.props));
                      if (subMenuToRender.length === 0) {
                        return null;
                      }

                      return (
                        <NavItemDropdown
                          icon={"fa fa-" + menu.icon}
                          label={menu.label}
                          key={menu.label + ":" + menu.link}
                          active={menu.isActive(this.props.router, menu.link)}
                        >
                          {subMenuToRender.map(subMenu => (
                            <DropdownItem
                              href={subMenu.link}
                              key={subMenu.label + ":" + subMenu.link}
                              active={subMenu.isActive(
                                this.props.router,
                                subMenu.link
                              )}
                            >
                              <i className={"fa fa-" + subMenu.icon} />{" "}
                              {subMenu.label}
                            </DropdownItem>
                          ))}
                        </NavItemDropdown>
                      );
                    } else {
                      return (
                        <NavItem
                          href={menu.link}
                          key={menu.label + ":" + menu.link}
                          active={menu.isActive(this.props.router, menu.link)}
                        >
                          <i className={"fa fa-" + menu.icon} /> {menu.label}
                        </NavItem>
                      );
                    }
                  })}

                  {/* <NavItem href="/index.html">
                    <i className="fa fa-home" /> Home
                  </NavItem> */}
                  {/* <NavItemDropdown icon="fa fa-calendar" label="Components">
                    <DropdownItem href="maps.html">Maps</DropdownItem>
                    <DropdownItem href="maps.html">Maps 2</DropdownItem>
                  </NavItemDropdown> */}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const QUERY = gql`
  query currentUser {
    currentUser {
      _id
      username
      Role {
        _id
        name
        privileges
      }
      status
      pictureUrl
    }
  }
`;

const LOGOUT = gql`
  mutation logOut {
    logOut
  }
`;

export default withRouter(props => (
  <ApolloConsumer>
    {client => (
      <Mutation mutation={LOGOUT}>
        {logOut => (
          // <Query query={QUERY}>
          //   {({ error, loading, data }) => (
          <Header
            {...props}
            client={client}
            // error={error}
            // loading={loading}
            currentUser={
              // data && data.currentUser
              //   ? data.currentUser
              //   :
              { username: "Loading..." }
            }
            logOut={logOut}
          />
          //   )}
          // </Query>
        )}
      </Mutation>
    )}
  </ApolloConsumer>
));

class RawProfileDropdown extends Component {
  state = {
    isOpen: false
  };

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  handleClickOutside = () => {
    this.setState({
      isOpen: false
    });
  };

  render() {
    return (
      <div className={"dropdown " + (this.state.isOpen ? "show" : "")}>
        <a
          href="#"
          className="nav-link pr-0 leading-none"
          data-toggle="dropdown"
          onClick={this.toggle}
          aria-expanded={this.state.isOpen ? "true" : "false"}
        >
          {!this.props.image ? null : (
            <span
              className="avatar"
              style={{
                backgroundImage: `url(${this.props.image})`
              }}
            />
          )}
          <span className="ml-2 d-none d-lg-block">
            <span className="text-default">{this.props.name}</span>
            <small className="text-muted d-block mt-1">{this.props.role}</small>
          </span>
        </a>
        <div
          className={
            "dropdown-menu dropdown-menu-right dropdown-menu-arrow " +
            (this.state.isOpen ? "show" : "")
          }
        >
          <Link href="/profil_saya">
            <a className="dropdown-item">
              <i className="dropdown-icon fe fe-user" /> Profil Saya
            </a>
          </Link>
          {/* <a className="dropdown-item">
            <i className="dropdown-icon fe fe-settings" /> Settings
          </a> */}
          {/* <a className="dropdown-item">
            <span className="float-right">
              <span className="badge badge-primary">6</span>
            </span>
            <i className="dropdown-icon fe fe-mail" /> Inbox
          </a> */}
          {/* <a className="dropdown-item">
            <i className="dropdown-icon fe fe-send" /> Message
          </a> */}
          <div className="dropdown-divider" />
          {/* <Link href="/bantuan">
            <a className="dropdown-item">
              <i className="dropdown-icon fe fe-help-circle" /> Bantuan
            </a>
          </Link> */}
          <a className="dropdown-item" href="#" onClick={this.props.onLogOut}>
            <i className="dropdown-icon fe fe-log-out" /> Logout
          </a>
        </div>
      </div>
    );
  }
}
const ProfileDropdown = enhanceWithClickOutside(RawProfileDropdown);

class NavItem extends Component {
  render() {
    return (
      <li className="nav-item ">
        <Link href={this.props.href}>
          <a className={"nav-link " + (this.props.active ? "active" : "")}>
            {this.props.children}
          </a>
        </Link>
      </li>
    );
  }
}

class RawNavItemDropdown extends Component {
  state = {
    isOpen: false
  };

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  handleClickOutside = () => {
    this.setState({
      isOpen: false
    });
  };

  render() {
    return (
      <li
        className={"nav-item dropdown " + (this.state.isOpen ? "show" : "")}
        aria-expanded={this.state.isOpen ? "true" : "false"}
      >
        <a
          href="#"
          className={"nav-link " + (this.props.active ? "active" : "")}
          data-toggle="dropdown"
          onClick={this.toggle}
        >
          <i className={this.props.icon} /> {this.props.label}
        </a>
        <div
          className={
            "dropdown-menu dropdown-menu-arrow " +
            (this.state.isOpen ? "show" : "")
          }
        >
          {this.props.children}
        </div>
      </li>
    );
  }
}
const NavItemDropdown = enhanceWithClickOutside(RawNavItemDropdown);

const DropdownItem = ({ href, children, active }) => (
  <Link href={href}>
    <a className={"dropdown-item " + (active ? "active" : "")}>{children}</a>
  </Link>
);

const SearchBox = () => (
  <div className="col-lg-3 ml-auto">
    <form className="input-icon my-3 my-lg-0">
      <input
        type="search"
        className="form-control header-search"
        placeholder="Search&hellip;"
        tabIndex="1"
      />
      <div className="input-icon-addon">
        <i className="fe fe-search" />
      </div>
    </form>
  </div>
);

const NotificationDropdown = () => (
  <div className="dropdown d-none d-md-flex">
    <a className="nav-link icon" data-toggle="dropdown">
      <i className="fe fe-bell" />
      <span className="nav-unread" />
    </a>
    <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
      <a href="#" className="dropdown-item d-flex">
        <span
          className="avatar mr-3 align-self-center"
          style={{
            backgroundImage: "url(/static/faces/male/41.jpg)"
          }}
        />
        <div>
          <strong>Nathan</strong> pushed new commit: Fix page load performance
          issue.
          <div className="small text-muted">10 minutes ago</div>
        </div>
      </a>
      <a href="#" className="dropdown-item d-flex">
        <span
          className="avatar mr-3 align-self-center"
          style={{
            backgroundImage: "url(/static/faces/female/1.jpg)"
          }}
        />
        <div>
          <strong>Alice</strong> started new task: Tabler UI design.
          <div className="small text-muted">1 hour ago</div>
        </div>
      </a>
      <a href="#" className="dropdown-item d-flex">
        <span
          className="avatar mr-3 align-self-center"
          style={{
            backgroundImage: "url(/static/faces/female/18.jpg)"
          }}
        />
        <div>
          <strong>Rose</strong> deployed new version of NodeJS REST Api V3
          <div className="small text-muted">2 hours ago</div>
        </div>
      </a>
      <div className="dropdown-divider" />
      <a href="#" className="dropdown-item text-center text-muted-dark">
        Mark all as read
      </a>
    </div>
  </div>
);
