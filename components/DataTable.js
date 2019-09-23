import React, { Component } from "react";
import ReactTable from "react-table";
import checkboxHOC from "react-table/lib/hoc/selectTable";
const CheckboxTable = checkboxHOC(ReactTable);
import { get } from "lodash";

const filterCaseInsensitive = (filter, row, column) => {
  const id = filter.pivotId || filter.id;

  let rowValue = ("" + get(row, id)).toLowerCase();
  const filterValue = ("" + filter.value).toLowerCase();
  if (rowValue.indexOf(filterValue) >= 0) {
    return true;
  }
  return false;
  // return row[id] !== undefined
  //   ? String(row[id])
  //       .toLowerCase()
  //       .startsWith(filter.value.toLowerCase())
  //   : true;
};

export default class DataTable extends Component {
  render() {
    const {
      title,
      loading,
      data,
      columns,
      defaultPageSize,
      selectType,
      onAddData,
      addButtonLabel,
      onEditData,
      editButtonLabel,
      onDeleteData,
      deleteButtonLabel,
      cardBorderColor,
      withoutCard,
      showPaginationBottom,
      showPageSizeOptions,
      filterable,
      withoutPadding,
      className,
      style,
      // server side data
      onFetchData,
      pages,
      page,
      pageSize,
      sorted,
      filtered
    } = this.props;
    const { selectAll, selection2 } = this.state;
    const {
      isSelected,
      toggleTableFilter,
      toggleSelection,
      toggleAll,
      deleteSelection
    } = this;

    let newColumns = [...columns];
    if (onEditData) {
      newColumns.push({
        Header: "",
        accessor: "_id",
        maxWidth: 70,
        filterable: false,
        Cell: props => (
          <div>
            <button
              className="btn btn-primary btn-sm btn-rounded"
              onClick={this.editSelected(props.original)}
            >
              <i className="fa fa-edit" />{" "}
              {editButtonLabel ? editButtonLabel : "Edit"}
            </button>
          </div>
        )
      });
    }

    return (
      <section
        className={
          (withoutCard ? "" : "card") +
          " card-" +
          (cardBorderColor ? cardBorderColor : "green")
        }
      >
        <div className={withoutPadding ? "" : "card-block"}>
          {!title ? null : (
            <h5 className="fa-pull-left">
              <b>{title}</b>
            </h5>
          )}
          <span className="fa-pull-right mb-2">
            {onAddData ? (
              <span>
                <button
                  className="btn btn-success btn-sm"
                  onClick={onAddData}
                  type="button"
                >
                  <i className="fa fa-plus-circle" />{" "}
                  {addButtonLabel ? addButtonLabel : "Add"}
                </button>
                &nbsp;
              </span>
            ) : null}
            {filterable === false ? null : (
              <span>
                <button
                  className="btn btn-default btn-sm"
                  onClick={toggleTableFilter}
                >
                  <i className="fa fa-filter" /> Filter
                </button>
                &nbsp;
              </span>
            )}
            {onDeleteData ? (
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={deleteSelection}
                disabled={Object.keys(selection2).length === 0}
              >
                <i className="fa fa-times" />{" "}
                {deleteButtonLabel ? deleteButtonLabel : "Delete Selected"}
              </button>
            ) : null}
          </span>
          <div className="clearfix" />

          <CheckboxTable
            filterable={this.state.tableFilterVisible}
            defaultFilterMethod={filterCaseInsensitive}
            className="-striped"
            loading={loading}
            data={data}
            columns={newColumns}
            defaultPageSize={defaultPageSize ? defaultPageSize : 10}
            selectType={selectType ? selectType : "checkbox"}
            selectAll={selectAll}
            isSelected={isSelected}
            toggleSelection={toggleSelection}
            toggleAll={toggleAll}
            showPaginationBottom={showPaginationBottom}
            showPageSizeOptions={showPageSizeOptions}
            className={className ? className : "-striped"}
            style={style}
            // ref={r => (this.checkboxTable = r)}
            manual={!!onFetchData}
            onFetchData={onFetchData}
            pages={pages}
            // page={page}
            // pageSize={pageSize}
            // sorted={sorted}
            // filtered={filtered}
          />
        </div>
      </section>
    );
  }

  state = {
    tableFilterVisible: false,
    selectAll: false,
    // selection: [],
    selection2: {}
  };

  cleanSelection = newData => {
    let selection2 = { ...this.state.selection2 };
    let selectionKeys = Object.keys(this.state.selection2);
    selectionKeys.forEach(key => {
      const found = newData.find(d => d._id === key);
      // console.log(key, !!found);
      if (!found) {
        delete selection2[key];
      }
    });

    const rows = Object.values(selection2);
    const keys = Object.keys(selection2);
    if (rows.length !== selectionKeys.length) {
      if (this.props.onChangeSelection) {
        this.props.onChangeSelection({
          rows,
          keys
        });
      }
      this.setState({
        selection2
      });
    }

    return selection2;
  };

  componentWillReceiveProps = nextProps => {
    this.cleanSelection(nextProps.data);
    return nextProps;
  };

  deleteSelection = e => {
    if (e) e.preventDefault();
    const selection2 = this.cleanSelection(this.props.data);
    const rows = Object.values(selection2);
    const keys = Object.keys(selection2);
    // console.log("deleteSelection", { rows, keys });
    if (this.props.onDeleteData && rows.length) {
      this.props.onDeleteData({
        rows,
        keys
      });
    }
  };

  editSelected = row => e => {
    if (e) e.preventDefault();
    if (this.props.onEditData) {
      this.props.onEditData({
        row,
        key: row._id
      });
    }
  };

  toggleTableFilter = e => {
    if (e) e.preventDefault();
    this.setState({ tableFilterVisible: !this.state.tableFilterVisible });
  };

  isSelected = key => {
    /*
          Instead of passing our external selection state we provide an 'isSelected'
          callback and detect the selection state ourselves. This allows any implementation
          for selection (either an array, object keys, or even a Javascript Set object).
        */

    // Old implementation
    // const res = this.state.selection.includes(key);
    // console.log("isSelected", key)
    return !!this.state.selection2[key];
  };

  toggleSelection = (key, shift, row) => {
    /*
          Implementation of how to manage the selection state is up to the developer.
          This implementation uses an array stored in the component state.
          Other implementations could use object keys, a Javascript Set, or Redux... etc.
        */
    // start off with the existing state

    // Old implementation
    // let selection = [...this.state.selection];
    // const keyIndex = selection.indexOf(key);
    // // check to see if the key exists
    // if (keyIndex >= 0) {
    //     // it does exist so we will remove it using destructing
    //     selection = [
    //         ...selection.slice(0, keyIndex),
    //         ...selection.slice(keyIndex + 1)
    //     ];
    // } else {
    //     // it does not exist so add it
    //     selection.push(key);
    // }
    // // update the state
    // this.setState({ selection });

    key = key.replace("select-", "");
    let selection2 = { ...this.state.selection2 };
    if (selection2[key]) {
      delete selection2[key];
    } else {
      selection2[key] = row;
    }
    // console.log("toggleSelection", selection2, key, row);
    this.setState({ selection2 });

    if (this.props.onChangeSelection) {
      this.props.onChangeSelection({
        rows: Object.values(selection2),
        keys: Object.keys(selection2)
      });
    }
  };

  toggleAll = () => {
    /*
          'toggleAll' is a tricky concept with any filterable table
          do you just select ALL the records that are in your data?
          OR
          do you only select ALL the records that are in the current filtered data?
          
          The latter makes more sense because 'selection' is a visual thing for the user.
          This is especially true if you are going to implement a set of external functions
          that act on the selected information (you would not want to DELETE the wrong thing!).
          
          So, to that end, access to the internals of ReactTable are required to get what is
          currently visible in the table (either on the current page or any other page).
          
          The HOC provides a method call 'getWrappedInstance' to get a ref to the wrapped
          ReactTable and then get the internal state and the 'sortedData'. 
          That can then be iterrated to get all the currently visible records and set
          the selection state.
        */

    const selectAll = this.state.selectAll ? false : true;
    // Old implementation
    // const selection = [];
    // if (selectAll) {
    //     // we need to get at the internals of ReactTable
    //     const wrappedInstance = this.checkboxTable.getWrappedInstance();
    //     // the 'sortedData' property contains the currently accessible records based on the filter and sort
    //     const currentRecords = wrappedInstance.getResolvedState()
    //         .sortedData;
    //     // we just push all the IDs onto the selection array
    //     currentRecords.forEach(item => {
    //         selection.push(item._original._id);
    //     });
    // }
    // this.setState({ selectAll, selection });

    let selection2 = {};
    if (selectAll) {
      selection2 = this.props.data.reduce((all, item) => {
        all[item._id] = item;
        return all;
      }, {});
    }
    this.setState({ selectAll, selection2 });

    if (this.props.onChangeSelection) {
      this.props.onChangeSelection({
        rows: Object.values(selection2),
        keys: Object.keys(selection2)
      });
    }
  };
}
