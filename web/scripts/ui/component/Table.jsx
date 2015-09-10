define(['react'], function(React) {

  var Table = React.createClass({
    render: function() {
      var self = this;
      var classNames = (this.props.className || '')+['', 'table-widget'].join(' ');
      
      return (
        <table className={classNames}>
          <thead>
            <tr>
              {this.props.columns.map(this.renderColumn)}
            </tr>
          </thead>
          <tbody>
            {this.props.rows.map(function(row) {
              return self.renderRow(row)
            })}
          </tbody>
          <tfoot>
          </tfoot>
        </table>
      )
    },

    renderColumn: function(column) {
      return (
        <th key={column.label}>{column.label}</th>
      )
    },

    renderRow: function(row, columns) {
      var i = 0;
      var self = this;
      return (
        <tr key={this.props.rowKey(row)} onClick={this.handleClickRow.bind(this, row)}>
          {
            this.props.columns.map(function(column) {
              return <td  key={self.props.rowKey(row) + '-' + i++}>{column.value(row)}</td>
            })
          }
        </tr>
      )
    },

    handleClickRow: function(row) {
      if (this.props.onClickRow) {
        this.props.onClickRow(row);
      }
    }
  });

  return Table;
})