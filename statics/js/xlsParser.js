/**
 * Created by trzmiel007 on 14/10/16.
 */
function XLSparser(window){
    var Char = {
        COMMA: ',',
        RETURN: '\r',
        NEWLINE: '\n',
        SEMICOLON: ';',
        TAB: '\t'
    };

    var DataType = {
        CURRENCY: 'CURRENCY',
        DATETIME: 'DATETIME',
        FORMULA: 'FORMULA',
        LOGICAL: 'LOGICAL',
        NUMBER: 'NUMBER',
        TEXT: 'TEXT'
    };

    var Exception = {
        CELL_NOT_FOUND: 'CELL_NOT_FOUND',
        COLUMN_NOT_FOUND: 'COLUMN_NOT_FOUND',
        ROW_NOT_FOUND: 'ROW_NOT_FOUND',
        ERROR_READING_FILE: 'ERROR_READING_FILE',
        ERROR_WRITING_FILE: 'ERROR_WRITING_FILE',
        FILE_NOT_FOUND: 'FILE_NOT_FOUND',
        FILETYPE_NOT_SUPPORTED: 'FILETYPE_NOT_SUPPORTED',
        INVALID_DOCUMENT_FORMAT: 'INVALID_DOCUMENT_FORMAT',
        INVALID_DOCUMENT_NAMESPACE: 'INVALID_DOCUMENT_NAMESPACE',
        MALFORMED_JSON: 'MALFORMED_JSON',
        UNIMPLEMENTED_METHOD: 'UNIMPLEMENTED_METHOD',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR',
        UNSUPPORTED_BROWSER: 'UNSUPPORTED_BROWSER'
    };

    var Format = {
        CSV: 'csv',
        JSON: 'json',
        XLS: 'xls',
        XLSX: 'xlsx'
    };

    var MIMEType = {
        CSV: 'text/csv',
        JSON: 'application/json',
        XLS: 'application/vnd.ms-excel',
        XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    var Regex = {
        FILENAME: /.*\./g,
        LINEBREAK: /\r\n/g
    };

    var Utils = {
        getFiletype: function (filename){
            return filename.replace(Regex.FILENAME, '');
        },
        isEqual: function (str1, str2, ignoreCase){
            return ignoreCase ? str1.toLowerCase() == str2.toLowerCase() : str1 == str2;
        },
        isSupportedBrowser: function (){
            return !![].forEach
                && !!window.FileReader;
        },
        overrideProperties: function (old, fresh){
            for(var i in old){
                if (old.hasOwnProperty(i)) {
                    old[i] = fresh.hasOwnProperty(i) ? fresh[i] : old[i];
                }
            }
            return old;
        }
    };

    /////////////////////////////
    // Spreadsheet Constructors
    ////////////////////////////

    var Cell = function (value, dataType) {
        var defaults = {
            value    : value || '',
            dataType : dataType || DataType.TEXT
        };
        if(typeof value == typeof {}) {
            defaults = Utils.overrideProperties(defaults, value);
        }
        this.value = defaults.value;
        this.dataType = defaults.dataType;
        this.toString = function () {
            return value.toString();
        }
    };

    var Records = function () {};
    Records.prototype = new Array();
    Records.prototype.getCell = function (colNum, rowNum) {
        return this[rowNum - 1][colNum - 1];
    };
    Records.prototype.getColumn = function (colNum) {
        var col = [];
        this.forEach(function (el, i) {
            col.push(el[colNum - 1]);
        });
        return col;
    };
    Records.prototype.getRow = function (rowNum) {
        return this[rowNum - 1];
    };

    var Sheet = function () {
        this.records = new Records();
    };
    Sheet.prototype.getCell = function (colNum, rowNum) {
        return this.records.getCell(colNum, rowNum);
    };
    Sheet.prototype.getColumn = function (colNum) {
        return this.records.getColumn(colNum);
    };
    Sheet.prototype.getRow = function (rowNum) {
        return this.records.getRow(rowNum);
    };

    /////////////
    // Parsers
    ////////////

    // Base Class
    var BaseParser = function () {};
    BaseParser.prototype = {
        _filetype   : '',
        _sheet      : [],
        getSheet    : function (number) {
            var number = number || 1;
            return this._sheet[number - 1].records;
        },
        loadFile    : function (file, callback) {
            var self = this;
            var reader = new FileReader();
            reader.onload = function () {
                self.loadString(this.result, 0);
                callback.apply(self);
            };
            reader.readAsText(file);]
            return self;
        },
        loadString  : function (string, sheetnum) {
            throw Exception.UNIMPLEMENTED_METHOD;
        }
    };

    // CSV
    var CSVParser = function () {};
    CSVParser.prototype = new BaseParser();
    CSVParser.prototype._delimiter = Char.COMMA;
    CSVParser.prototype._filetype = Format.CSV;
    CSVParser.prototype.loadString = function (str, sheetnum) {
        // TODO: implement real CSV parser
        var self = this;
        var sheetnum = sheetnum || 0;
        self._sheet[sheetnum] = new Sheet();
        str.replace(Regex.LINEBREAK, Char.NEWLINE).split(Char.NEWLINE).forEach(function (el, i) {
            var row = [];
            el.split(self._delimiter).forEach(function (el) {
                row.push(new Cell(el));
            });
            self._sheet[sheetnum].insertRecord(row);
        });
        return self;
    };
    CSVParser.prototype.setDelimiter = function (separator) {
        this._delimiter = separator;
        return this;
    };

    // Export var
    var Parser = {
        CSV : CSVParser
    };


    /////////////
    // Exports
    ////////////

    return {
        Cell                : Cell,
        DataType            : DataType,
        Exception           : Exception,
        isSupportedBrowser  : Utils.isSupportedBrowser(),
        Parser              : Parser,
        Sheet               : Sheet
    };
}