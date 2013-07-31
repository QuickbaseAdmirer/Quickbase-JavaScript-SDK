//QuickBase Client for JavaScript
// updated 7/31/2013 by cjvr

function QuickBaseClient( qdbServer )
{
    if ( qdbServer )
    {
        this.qdbServer = qdbServer;
    }
    else
    {
        this.qdbServer = "";
    }

    this.username = "";
    this.password = "";
    this.ticket = "";
    this.errorcode = "";
    this.errortext = "";
    this.errordetail = "";
    this.errormessage = "";
    this.apptoken = "";

    document.location.href.match( /\/db\/([^\?]+)\?/ );
    this.dbid = RegExp.$1;

    this.Authenticate = function ( username, password )
    {
        this.username = username;
        this.password = password;
        this.ticket = "";
    }

    this.GetTicket = function ()
    {
        var xmlQDBRequest = this.initXMLRequest();
        xmlQDBResponse = this.APIXMLPost( "main", "API_Authenticate", xmlQDBRequest );
        var newTicket = this.selectSingleNode( xmlQDBResponse, "/*/ticket" );
        if ( newTicket )
        {
            return this.text( newTicket );
        }
    }

    this.SetAppToken = function ( apptoken )
    {
        this.apptoken = apptoken;
    }

    this.GetSchema = function ( dbid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        return this.APIXMLPost( dbid, "API_GetSchema", xmlQDBRequest );
    }

    this.GetDBInfo = function ( dbid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        return this.APIXMLPost( dbid, "API_GetDBInfo", xmlQDBRequest );
    }

    this.CloneDatabase = function ( dbid, newdbname, newdbdesc )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "newdbname", newdbname );
        this.addParameter( xmlQDBRequest, "newdbdesc", newdbdesc );
        xmlQDBResponse = this.APIXMLPost( dbid, "API_CloneDatabase", xmlQDBRequest );
        var newdbid = this.selectSingleNode( xmlQDBResponse, "/*/newdbid" );
        if ( newdbid )
        {
            return newdbid.childNodes[0].nodeValue;
        }
        return newdbid;
    }


    this.AddField = function ( dbid, label, type, mode )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "label", label );
        this.addParameter( xmlQDBRequest, "type", type );
        if ( mode != "" )
        {
            this.addParameter( xmlQDBRequest, "mode", mode );
        }
        var xmlQDBResponse = this.APIXMLPost( dbid, "API_AddField", xmlQDBRequest );
        var fid = this.selectSingleNode( xmlQDBResponse, "/*/fid" );
        if ( fid )
        {
            return fid.childNodes[0].nodeValue;
        }
        return fid;
    }

    this.DeleteField = function ( dbid, fid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "fid", fid );
        var xmlQDBResponse = this.APIXMLPost( dbid, "API_DeleteField", xmlQDBRequest );
        return;
    }

    this.FieldAddChoices = function ( dbid, fid, choiceArray )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "fid", fid );
        for ( var choiceCounter = 0; choiceCounter < choiceArray.length; choiceCounter++ )
        {
            this.addParameter( xmlQDBRequest, "choice", choiceArray[choiceCounter] );
        }
        var xmlQDBResponse = this.APIXMLPost( dbid, "API_FieldAddChoices", xmlQDBRequest );
        var numadded = this.selectSingleNode( xmlQDBResponse, "/*/numadded" );
        if ( numadded )
        {
            return numadded.childNodes[0].nodeValue;
        }
        return numadded;
    }

    this.FieldRemoveChoices = function ( dbid, fid, choiceArray )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "fid", fid );
        for ( var choiceCounter = 0; choiceCounter < choiceArray.length; choiceCounter++ )
        {
            this.addParameter( xmlQDBRequest, "choice", choiceArray[choiceCounter] );
        }
        var xmlQDBResponse = this.APIXMLPost( dbid, "API_FieldRemoveChoices", xmlQDBRequest );
        var numremoved = this.selectSingleNode( xmlQDBResponse, "/*/numremoved" );
        if ( numremoved )
        {
            return numremoved.childNodes[0].nodeValue;
        }
        return numremoved;
    }

    this.SetFieldProperties = function ( dbid, fid, propertyName, value )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "fid", fid );
        this.addParameter( xmlQDBRequest, propertyName, value );
        return this.APIXMLPost( dbid, "API_SetFieldProperties", xmlQDBRequest );
    }

    this.GrantedDBs = function ( withembeddedtables, Excludeparents, adminOnly )
    {
        var xmlQDBRequest = this.initXMLRequest();
        if ( withembeddedtables != undefined )
        {
            this.addParameter( xmlQDBRequest, "withembeddedtables", withembeddedtables );
        }
        if ( Excludeparents != undefined )
        {
            this.addParameter( xmlQDBRequest, "Excludeparents", Excludeparents );
        }
        if ( adminOnly != undefined )
        {
            this.addParameter( xmlQDBRequest, "adminOnly", adminOnly );
        }
        return this.APIXMLPost( "main", "API_GrantedDBs", xmlQDBRequest );
    }

    this.AddRecord = function ( dbid, recordArray, ignoreError )
    {
        var xmlQDBRequest = this.initXMLRequest();
        for ( var fieldCounter = 0; fieldCounter < recordArray.length; fieldCounter += 2 )
        {
            this.addFieldParameter( xmlQDBRequest, recordArray[fieldCounter], recordArray[fieldCounter + 1] );
        }
        if ( ignoreError )
        {
            this.addParameter( xmlQDBRequest, "ignoreError", "1" );
        }
        return this.APIXMLPost( dbid, "API_AddRecord", xmlQDBRequest );
    }


    this.EditRecord = function ( dbid, rid, recordArray )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "rid", rid );
        for ( var fieldCounter = 0; fieldCounter < recordArray.length; fieldCounter += 2 )
        {
            this.addFieldParameter( xmlQDBRequest, recordArray[fieldCounter], recordArray[fieldCounter + 1] );
        }
        return this.APIXMLPost( dbid, "API_EditRecord", xmlQDBRequest );
    }


    this.DeleteRecord = function ( dbid, rid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "rid", rid );
        return this.APIXMLPost( dbid, "API_DeleteRecord", xmlQDBRequest );
    }

    //force this.query to use passed in query for the query parameter (not qname or qid) when calling API_DoQuery
    this.DoQueryWithQueryString = function ( dbid, query, clist, slist, options )
    {
        return this.query( dbid, query, clist, slist, options, "structured", true );
    }

    this.DoQuery = function ( dbid, query, clist, slist, options )
    {
        return this.query( dbid, query, clist, slist, options, "structured", false );
    }

    this.DoQueryADO = function ( dbid, query, clist, slist, options )
    {
        return this.query( dbid, query, clist, slist, options, "xado", false );
    }

    this.query = function query( dbid, query, clist, slist, options, fmt, useQueryParam )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "fmt", fmt );
        if ( useQueryParam )
        {
            this.addParameter( xmlQDBRequest, "query", query );
        }
        else
        {
            if ( query.match( /^\{.*\}$/ ) )
            {
                this.addParameter( xmlQDBRequest, "query", query );
            }
            else if ( query.match( /^-?[1-9][0-9]*$/ ) )
            {
                this.addParameter( xmlQDBRequest, "qid", query );
            }
            else
            {
                this.addParameter( xmlQDBRequest, "qname", query );
            }
        }
        this.addParameter( xmlQDBRequest, "clist", clist );
        this.addParameter( xmlQDBRequest, "slist", slist );
        this.addParameter( xmlQDBRequest, "options", options );
        return this.APIXMLPost( dbid, "API_DoQuery", xmlQDBRequest );
    }

    this.PurgeRecords = function ( dbid, query )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "query", query );
        return this.APIXMLPost( dbid, "API_PurgeRecords", xmlQDBRequest );
    }

    this.ImportFromCSV = function ( dbid, CSV, clist, rids, skipfirst )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "clist", clist );
        this.addParameter( xmlQDBRequest, "skipfirst", skipfirst );
        this.addCDATAParameter( xmlQDBRequest, "records_csv", CSV );
        var xmlQDBResponse = this.APIXMLPost( dbid, "API_ImportFromCSV", xmlQDBRequest );
        var RidNodeList = this.selectNodes( xmlQDBResponse, "/*/rids/rid" );
        var ridListLength = RidNodeList.length;
        for ( var i = 0; i < ridListLength; i++ )
        {
            rids.push( RidNodeList[i].childNodes[0].nodeValue );
        }
        var result = this.selectSingleNode( xmlQDBResponse.documentElement, "/*/num_recs_added" );
        var numrecords = 0;
        if ( result )
        {
            numrecords += parseInt( result.childNodes[0].nodeValue );
        }
        result = this.selectSingleNode( xmlQDBResponse.documentElement, "/*/num_recs_updated" );
        if ( result )
        {
            numrecords += parseInt( result.childNodes[0].nodeValue );
        }
        return numrecords;
    }

    this.ListDBPages = function ( dbid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        return this.APIXMLPost( dbid, "API_ListDBpages", xmlQDBRequest );
    }

    this.GetDBPage = function ( dbid, page )
    {
        var xmlQDBRequest = this.initXMLRequest();
        if ( page.match( /^[1-9][0-9]*$/ ) )
        {
            this.addParameter( xmlQDBRequest, "pageid", page );
        }
        else
        {
            this.addParameter( xmlQDBRequest, "pagename", page );
        }
        return this.APIXMLPost( dbid, "API_GetDBPage", xmlQDBRequest );
    }

    this.AddReplaceDBPage = function ( dbid, page, pagetype, pagebody )
    {
        var xmlQDBRequest = this.initXMLRequest();
        if ( page.match( /^[1-9][0-9]*$/ ) )
        {
            this.addParameter( xmlQDBRequest, "pageid", page );
        }
        else
        {
            this.addParameter( xmlQDBRequest, "pagename", page );
        }
        this.addParameter( xmlQDBRequest, "pagetype", pagetype );
        this.addParameter( xmlQDBRequest, "pagebody", pagebody );
        return this.APIXMLPost( dbid, "API_AddReplaceDBPage", xmlQDBRequest );
    }

    /**
    * AddUserToRole: Add a user to a role in an application.
    * @param dbid The unique identifier of a QuickBase application.
    * @param userid The unique identifier of a QuickBase user.
    * @param roleid The unique identifier of a QuickBase role.
    * @return boolean
    */
    this.AddUserToRole = function ( dbid, userid, roleid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "userid", userid );
        this.addParameter( xmlQDBRequest, "roleid", roleid );
        xmlQDBResponse = this.APIXMLPost( dbid, "API_AddUserToRole", xmlQDBRequest );
        return xmlQDBResponse;
    }

    /**
    * ChangeRecordOwner: Change the owner of a record from a QuickBase table.
    * @param dbid The unique identifier of a QuickBase database.
    * @param rid String containing the record ID of the record to be deleted. 
    * @param newowner String containing the screenname or email address of the new record owner. 
    */
    this.ChangeRecordOwner = function ( dbid, rid, newowner )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "rid", rid );
        this.addParameter( xmlQDBRequest, "newowner", newowner );
        xmlQDBResponse = this.APIXMLPost( dbid, "API_ChangeRecordOwner", xmlQDBRequest );
        return xmlQDBResponse;
    }

    /**
    * ChangeUserRole: Change the role of a user in a particular application.
    * @param userid The unique identifier of a QuickBase user.
    * @param roleid The unique identifier of the user's current QuickBase role.
    * @param newroleid The unique identifier of the new QuickBase role for the user.
    */
    this.ChangeUserRole = function ( dbid, userid, roleid, newroleid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "userid", userid );
        this.addParameter( xmlQDBRequest, "roleid", roleid );
        this.addParameter( xmlQDBRequest, "newroleid", newroleid );
        xmlQDBResponse = this.APIXMLPost( dbid, "API_ChangeUserRole", xmlQDBRequest );
        return xmlQDBResponse;
    }

    /**
    * CreateDatabase: Create a new application.
    * @param dbname The name of the application to create.
    * @param dbdesc The description of the application to create.
    */
    this.CreateDatabase = function ( dbname, dbdesc )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "dbname", dbname );
        this.addParameter( xmlQDBRequest, "dbdesc", dbdesc );
        xmlQDBResponse = this.APIXMLPost( "main", "API_CreateDatabase", xmlQDBRequest );
        var newdbid = this.selectSingleNode( xmlQDBResponse, "/*/newdbid" );
        if ( newdbid )
        {
            return newdbid.childNodes[0].nodeValue;
        }
        return newdbid;
    }

    /**
    * CreateTable: Add a table to an existing application.
    * @param dbid The unique identifier of a QuickBase application.
    * @param pnoun The plural noun to use as the name of the table. Records will be referred to as the singular version of this noun.
    * @return String The unique identifier of the new table.
    */
    this.CreateTable = function ( dbid, pnoun )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "pnoun", pnoun );
        xmlQDBResponse = this.APIXMLPost( dbid, "API_CreateTable", xmlQDBRequest );
        var newdbid = this.selectSingleNode( xmlQDBResponse, "/*/newdbid" );
        if ( newdbid )
        {
            return newdbid.childNodes[0].nodeValue;
        }
        else
        {
            newdbid = this.selectSingleNode( xmlQDBResponse, "/*/newDBID" );
            if ( newdbid )
            {
                return newdbid.childNodes[0].nodeValue;
            }
        }
        return newdbid;
    }

    /**
    * DeleteDatabase: Delete an application. Use carefully!
    * @param dbid The unique identifier of a QuickBase table.
    */
    this.DeleteDatabase = function ( dbid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        xmlQDBResponse = this.APIXMLPost( dbid, "API_DeleteDatabase", xmlQDBRequest );
        return xmlQDBResponse;
    }

    /**
    * FindDBByName: Retrieve the database id associated with the database name.
    * @param dbname the complete name of a QuickBase database.
    * @return the QuickBase database ID
    */
    this.FindDBByName = function ( dbname )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "dbname", dbname );
        xmlQDBResponse = this.APIXMLPost( "main", "API_FindDBByName", xmlQDBRequest );
        var dbid = this.selectSingleNode( xmlQDBResponse, "/*/dbid" );
        if ( dbid )
        {
            return dbid.childNodes[0].nodeValue;
        }
        return dbid;
    }

    /**
    * GetDBvar: Retrieve the value of an application variable.
    * @param dbid The unique identifier of a QuickBase application.
    * @param varname The name of the variable to retrieve.
    * @return String The value of the aplication variable.
    */
    this.GetDBvar = function ( dbid, varname )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "varname", varname );
        xmlQDBResponse = this.APIXMLPost( dbid, "API_GetDBvar", xmlQDBRequest );
        var value = this.selectSingleNode( xmlQDBResponse, "/*/value" );
        if ( value )
        {
            return value.childNodes[0].nodeValue;
        }
        return value;
    }

    /**
    * GetNumRecords:
    * @param dbid The unique identifier of a QuickBase table.
    * @return num_records The number of records in the QuickBase table.
    */
    this.GetNumRecords = function ( dbid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        xmlQDBResponse = this.APIXMLPost( dbid, "API_GetNumRecords", xmlQDBRequest );
        var num_records = this.selectSingleNode( xmlQDBResponse, "/*/num_records" );
        if ( num_records )
        {
            return num_records.childNodes[0].nodeValue;
        }
        return num_records;
    }

    /**
    * GenAddRecordForm: Get the HTML for adding a record to a particular table.
    * @param dbid The unique identifier of a QuickBase table.
    * @param fieldvalues an Array of field:value strings in the format field:value.
    * @return String HTML for adding a record.
    */
    this.GenAddRecordForm = function ( dbid, fieldvalues )
    {
        var action = "API_GenAddRecordForm";
        for ( var fieldIndex = 0; fieldIndex < fieldvalues.length; fieldIndex++ )
        {
            fieldValuePair = fieldvalues[fieldIndex].split( ":" );
            action = action + "&" + fieldValuePair[0] + "=" + fieldValuePair[1]
        }
        return this.GetURL( dbid, action );
    }

    /**
    * GenResultsTable: HTML representation of zero or more QuickBase records.
    * @param dbid The unique identifier of a QuickBase table.
    * @param query A QuickBase query that selects zero or more records. 
    * @param clist A period delimited list of field identifiers defining which fields to output. 
    * @param slist A period delimited list of field identifiers defining which fields to sort on. 
    * @param options A string indicating ascending vs descending sort order and data output format. 
    * @return  HTML table of field names across the top and one row for each record.
    */
    this.GenResultsTable = function ( dbid, query, clist, slist, jht, jsa, options )
    {
        var action = "API_GenResultsTable";
        action = action + "&query=" + query;
        action = action + "&clist=" + clist;
        action = action + "&slist=" + slist;
        action = action + "&jht=" + jht;
        action = action + "&jsa=" + jsa;
        action = action + "&options=" + options;
        return this.GetURL( dbid, action );
    }

    /**
    * GetOneTimeTicket: Retrieve a ticket valid for the next 5 minutes only. Designed for uploading files.
    * @return String The ticket.
    */
    this.GetOneTimeTicket = function ()
    {
        var xmlQDBRequest = this.initXMLRequest();
        xmlQDBResponse = this.APIXMLPost( "main", "API_GetOneTimeTicket", xmlQDBRequest );
        var ticket = this.selectSingleNode( xmlQDBResponse, "/*/ticket" );
        if ( ticket )
        {
            return ticket.childNodes[0].nodeValue;
        }
        return ticket;
    }

    /**
    * GetRecordAsHTML: Retrieve the HTML of a single database record.
    * @param dbid The unique identifier of a QuickBase database.
    * @param rid The unique identifier of a QuickBase record. 
    * @return Two column HTML table of field names and field values.
    */
    this.GetRecordAsHTML = function ( dbid, rid )
    {
        return this.GetURL( dbid, "API_GetRecordAsHTML&rid=" + rid );
    }

    /**
    * GetRecordInfo: Returns a Xml Document of all the field values of a given record.
    * @param dbid The unique identifier of a QuickBase table.
    * @param rid The unique identifier of a QuickBase record.
    * @return Document The XML document of record information.
    */
    this.GetRecordInfo = function ( dbid, rid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "rid", rid );
        xmlQDBResponse = this.APIXMLPost( dbid, "API_GetRecordInfo", xmlQDBRequest );
        return xmlQDBResponse;
    }

    /**
    * GetRoleInfo: Returns an Xml Document of role information for an application.
    * @param dbid The unique identifier of a QuickBase application.
    * @return Document The XML Document of role information.
    */
    this.GetRoleInfo = function ( dbid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        xmlQDBResponse = this.APIXMLPost( dbid, "API_GetRoleInfo", xmlQDBRequest );
        return xmlQDBResponse;
    }

    /**
    * GetUserInfo: Returns an Xml Document of information about a user.
    * @param email The email address of the user.
    * @return Document The XML Document of user information.
    */
    this.GetUserInfo = function ( email )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "email", email );
        xmlQDBResponse = this.APIXMLPost( "main", "API_GetUserInfo", xmlQDBRequest );
        return xmlQDBResponse;
    }

    /**
    * GetUserRole: Returns an Xml Document of role information for a given user and application.
    * @param dbid The unique identifier of a QuickBase application.
    * @param userid The unique identifier of a QuickBase user.
    * @return Document The XML Document of User Role information for the specified user.
    */
    this.GetUserRole = function ( dbid, userid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "userid", userid );
        xmlQDBResponse = this.APIXMLPost( dbid, "API_GetUserRole", xmlQDBRequest );
        return xmlQDBResponse;
    }

    /**
    * ProvisionUser: Add information about a potential new user to an application.
    * @param dbid The unique identifier of a QuickBase application.
    * @param roleid The unique identifier of a QuickBase role.
    * @param email The new user's email address.
    * @param fname The new user's first name.
    * @param lname The new user's last name.
    * @return String The userid of the new user.
    */
    this.ProvisionUser = function ( dbid, roleid, email, fname, lname )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "roleid", roleid );
        this.addParameter( xmlQDBRequest, "email", email );
        this.addParameter( xmlQDBRequest, "fname", fname );
        this.addParameter( xmlQDBRequest, "lname", lname );
        xmlQDBResponse = this.APIXMLPost( dbid, "API_ProvisionUser", xmlQDBRequest );
        var userid = this.selectSingleNode( xmlQDBResponse, "/*/userid" );
        if ( userid )
        {
            return userid.childNodes[0].nodeValue;
        }
        return userid;
    }

    /**
    * RemoveUserFromRole: Remove a user from a role in an application.
    * @param dbid The unique identifier of a QuickBase application.
    * @param userid The unique identifier of a QuickBase user.
    * @param roleid The unique identifier of a QuickBase role.
    */
    this.RemoveUserFromRole = function ( dbid, userid, roleid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "userid", userid );
        this.addParameter( xmlQDBRequest, "roleid", roleid );
        xmlQDBResponse = this.APIXMLPost( dbid, "API_RemoveUserFromRole", xmlQDBRequest );
        return xmlQDBResponse;
    }

    /**
    * RenameApp: Change the name of an application.
    * @param dbid The unique identifier of a QuickBase application.
    * @param newappname The new name for the application.
    */
    this.RenameApp = function ( dbid, newappname )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "newappname", newappname );
        xmlQDBResponse = this.APIXMLPost( dbid, "API_RenameApp", xmlQDBRequest );
        return xmlQDBResponse;
    }

    /**
    * SetDBvar: Set the value of an application variable.
    * @param dbid The unique identifier of a QuickBase application.
    * @param varname The name of the variable to set.
    * @param value The value to set.
    */
    this.SetDBvar = function ( dbid, varname, value )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "varname", varname );
        this.addParameter( xmlQDBRequest, "value", value );
        xmlQDBResponse = this.APIXMLPost( dbid, "API_SetDBvar", xmlQDBRequest );
        return xmlQDBResponse;
    }

    /**
    * SendInvitation: Send an email from QuickBase inviting a user to an application. 
    * @param dbid The unique identifier of a QuickBase application.
    * @param userid The unique identifier of a QuickBase user.
    */
    this.SendInvitation = function ( dbid, userid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter( xmlQDBRequest, "userid", userid );
        xmlQDBResponse = this.APIXMLPost( dbid, "API_SendInvitation", xmlQDBRequest );
        return xmlQDBResponse;
    }

    /**
    * SignOut: Sign out of QuickBase explicitly. 
    * Means username and password will be used for the next API call.
    */
    this.SignOut = function ()
    {
        var xmlQDBRequest = this.initXMLRequest();
        xmlQDBResponse = this.APIXMLPost( "main", "API_SignOut", xmlQDBRequest );
        return xmlQDBResponse;
    }

    /**
    * UserRoles: Returns an Xml Document of information about the roles defined for an application.
    * @param dbid The unique identifier of a QuickBase application.
    * @return Document The XML Document of all User Role information.
    */
    this.UserRoles = function ( dbid )
    {
        var xmlQDBRequest = this.initXMLRequest();
        xmlQDBResponse = this.APIXMLPost( dbid, "API_UserRoles", xmlQDBRequest );
        return xmlQDBResponse;
    }

    var xmlQDBRequest;

     function createXMLDOM()
        {
            try
            {
                return new ActiveXObject("Microsoft.XmlDom");
            }
            catch(e)
            {
            }
            try
            {
                return document.implementation.createDocument("", "", null);
            }
            catch(ex) { }
            throw new Error("Sorry. Your browser does not support QuickBaseClient.js." + ex.message);
        };

    this.initXMLRequest = function ()
    {
        xmlQDBRequest = createXMLDOM();
        xmlQDBRequest.async = false;
        xmlQDBRequest.resolveExternals = false;

        var root = xmlQDBRequest.createElement( "qdbapi" );
        try
        {
            xmlQDBRequest.removeChild( xmlQDBRequest.documentElement );
        }
        catch ( e )
        {
        }
        xmlQDBRequest.appendChild( root );

        if ( !this.ticket )
        {
            if ( this.username )
            {
                this.addParameter( xmlQDBRequest, "username", this.username );
                this.addParameter( xmlQDBRequest, "password", this.password );
            }
        }
        else
        {
            this.addParameter( xmlQDBRequest, "ticket", this.ticket );
        }
        if ( this.apptoken )
        {
            this.addParameter( xmlQDBRequest, "apptoken", this.apptoken );
        }

        return xmlQDBRequest;
    }

    this.addParameter = function ( xmlQDBRequest, Name, Value )
    {
        var Root = xmlQDBRequest.documentElement;
        var ElementNode = xmlQDBRequest.createElement( Name );
        var TextNode = xmlQDBRequest.createTextNode( Value );
        ElementNode.appendChild( TextNode );
        Root.appendChild( ElementNode );
    }

    this.addFieldParameter = function ( xmlQDBRequest, fieldName, Value )
    {
        var Root = xmlQDBRequest.documentElement;
        var ElementNode = xmlQDBRequest.createElement( "field" );
        var attrField;
        if ( fieldName.match( /^[1-9]\d*$/ ) )
        {
            ElementNode.setAttribute( "fid", fieldName )
        }
        else
        {
            fieldName = fieldName.replace( /[^a-z0-9]/ig, "_" ).toLowerCase();
            ElementNode.setAttribute( "name", fieldName )
        }
        var TextNode = xmlQDBRequest.createTextNode( Value );
        ElementNode.appendChild( TextNode );
        Root.appendChild( ElementNode );
    }

    this.addCDATAParameter = function ( xmlQDBRequest, Name, Value )
    {
        var Root = xmlQDBRequest.documentElement;
        var ElementNode = xmlQDBRequest.createElement( Name );
        var CDATANode = xmlQDBRequest.createCDATASection( Value );
        ElementNode.appendChild( CDATANode );
        Root.appendChild( ElementNode );
    }

    var xmlHTTPPost;
    XMLhttpInit();

 function XMLhttpInit()
    {
		if(xmlHTTPPost)
			return;
		try
		{
			xmlHTTPPost = new ActiveXObject("Msxml2.XMLHTTP");
			try { xmlHTTPPost.responseType = "msxml-document"; } catch(err) { }
			return;
		}
		catch(e)
		{
		}
		try
		{
			xmlHTTPPost = new ActiveXObject("Microsoft.XMLHTTP");
			try { xmlHTTPPost.responseType = "msxml-document"; } catch(err) { }
			return;
		}
		catch(e)
		{
		}
		try
		{
			xmlHTTPPost = new XMLHttpRequest();
		}
		catch(e)
		{
			alert("Sorry. This browser does not support QuickBaseClient. " + e.message);
		}
	}

     this.APIXMLPost = function(dbid, action, xmlQDBRequest)
        {
            var script;
            script = this.qdbServer + "/db/" + dbid + "?act=" + action;
            xmlHTTPPost.open("POST", script, false);
            xmlHTTPPost.setRequestHeader("Content-Type", "text/xml");
            try
            {
                xmlHTTPPost.send(xmlQDBRequest);
            }
            catch(e)
            {
                if(!this.serializer)
                    {
                    this.serializer = new XMLSerializer();
                    }
                xmlHTTPPost.send(this.serializer.serializeToString(xmlQDBRequest.documentElement));
            }
            var xmlAPI = xmlHTTPPost.responseXML;
            this.errorcode = this.selectSingleNode(xmlAPI, "/*/errcode");
            if(this.errorcode)
            {
                this.errorcode = this.text(this.errorcode);
            }
            else
            {
                this.errorcode = "";
            }
            this.errortext = this.selectSingleNode(xmlAPI, "/*/errtext");
            if(this.errortext)
            {
                this.errortext = this.text(this.errortext);
            }
            else
            {
                this.errortext = "";
            }
            this.errordetail = this.selectSingleNode(xmlAPI, "/*/errdetail");
            if(this.errordetail)
            {
                this.errordetail = this.text(this.errordetail);
            }
            else
            {
                this.errordetail = "";
            }
            this.ticket = this.selectSingleNode(xmlAPI, "/*/ticket");
            if(this.ticket)
            {
                this.ticket = this.text(this.ticket);
            }
            else
            {
                this.ticket = "";
            }
            this.errormessage = "\r\n\r\n" + this.errordetail;
            return xmlAPI;
        }

    this.xpe = null;
    this.nsResolver = null;

     this.selectSingleNode = function(aNode, aExpr)
        {
            if((typeof aNode.selectSingleNode) != "undefined")
            {
                return aNode.selectSingleNode(aExpr);
            }
            else
            {
                if(XPathEvaluator)
                {
                    if(this.xpe == null)
                    {
                        this.xpe = new XPathEvaluator();
                    }
                    this.nsResolver = this.xpe.createNSResolver(aNode.ownerDocument == null ? aNode.documentElement : aNode.ownerDocument.documentElement);
                    return this.xpe.evaluate(aExpr, aNode, this.nsResolver, 0, null).iterateNext();
                }
                else
                {
                    if(!this.wgxpath)
                        {
                        this.wgxpath = true;
                        wgxpath.install(window);
                        }
                    var expression = window.document.createExpression(aExpr);
                    return expression.evaluate(aNode, wgxpath.XPathResultType.FIRST_ORDERED_NODE_TYPE);
                }
            }
        }
		
        this.selectNodes = function(aNode, aExpr)
        {
            if((typeof aNode.selectNodes) != "undefined")
            {
                return aNode.selectNodes(aExpr);
            }
            else
            {
                if(XPathEvaluator)
                {
                    if((this.xpe == null) && XPathEvaluator)
                    {
                        this.xpe = new XPathEvaluator();
                    }
                    this.nsResolver = this.xpe.createNSResolver(aNode.ownerDocument == null ? aNode.documentElement : aNode.ownerDocument.documentElement);
                    var result = this.xpe.evaluate(aExpr, aNode, this.nsResolver, 0, null);
                }
                else
                {
                    if(!this.wgxpath)
                        {
                        this.wgxpath = true;
                        wgxpath.install(window);
                        }
                    var expression = window.document.createExpression(aExpr);
                    var result = expression.evaluate(aNode, wgxpath.XPathResultType.ORDERED_NODE_ITERATOR_TYPE);
                }
                var found = [];
                var res;
                while(res = result.iterateNext())
                {
                    found.push(res);
                }
                return found;
            }
        }
    this.text = function ( node )
		{
			if ( ( typeof node.text ) != "undefined" )
			{
				return node.text;
			}
			return node.textContent;
		};

    this.GetURL = function ( dbid, action )
    {
        var script;
        script = this.qdbServer + "/db/" + dbid + "?act=" + action + "&apptoken=" + this.apptoken;
        xmlHTTPPost.open( "GET", script, false );
        xmlHTTPPost.send( null );
        return xmlHTTPPost.responseText;
    }


    this.displayErrorAlert = function ( message )
    {
        if ( this.errorcode != '0' )
        {
            alert( message + " " + this.errormessage );
            return true;
        }
        else
        {
            return false;
        }
    }

    this.HTTPPost = function ( dbid, querystring, content, contentType )
    {
        var script;
        var xmlHTTPPost = new ActiveXObject( "Microsoft.XMLHTTP" );
        script = this.qdbServer + "/db/" + dbid + "?" + querystring;
        xmlHTTPPost.open( "POST", script, false );
        xmlHTTPPost.setRequestHeader( "Content-Type", contentType );
        xmlHTTPPost.send( content );
        return xmlHTTPPost.responseText;
    }


    monthNames = new Array( 12 )
    monthNames[1] = "January"
    monthNames[2] = "February"
    monthNames[3] = "March"
    monthNames[4] = "April"
    monthNames[5] = "May"
    monthNames[6] = "June"
    monthNames[7] = "July"
    monthNames[8] = "August"
    monthNames[9] = "September"
    monthNames[10] = "October"
    monthNames[11] = "November"
    monthNames[12] = "December"

    dayNames = new Array( 7 )
    dayNames[1] = "Sunday"
    dayNames[2] = "Monday"
    dayNames[3] = "Tuesday"
    dayNames[4] = "Wednesday"
    dayNames[5] = "Thursday"
    dayNames[6] = "Friday"
    dayNames[7] = "Saturday"

    this.format = function ( data, format )
    {
        if ( format.match( /^date/i ) )
        {
            var intData = parseInt( data );
            var objGMTDate = new Date( intData );
            var milliGMToffset = objGMTDate.getTimezoneOffset() * 60000;
            var oneDate = new Date( intData + milliGMToffset );
            var date = oneDate.getDate();
            var day = oneDate.getDay() + 1;
            var month = oneDate.getMonth() + 1;
            var theYear = oneDate.getYear();
            if ( theYear < 1900 )
            {
                theYear += 1900;
            }
            if ( format.match( /friend/i ) )
            {
                return monthNames[month] + " " + date + ", " + theYear;
            }
            if ( format.match( /long/i ) )
            {
                return dayNames[day] + ", " + monthNames[month] + " " + date + ", " + theYear;
            }
            else if ( format.match( /timestamp/i ) )
            {
                return oneDate.toLocaleString();
            }
            else
            {
                return month + "-" + date + "-" + theYear;
            }
        }
        if ( format.match( /^timeofday/ ) )
        {
            data = parseInt( data );
            var intHours = Math.floor( data / 3600000 );
            var intMinutes = Math.floor( data / 60000 ) % 60;
            if ( intMinutes < 10 ) { intMinutes = "0" + intMinutes; }
            return "" + intHours + ":" + intMinutes;
        }
    }

    var objGMTDate = new Date();
    var milliGMToffset = ( objGMTDate.getTimezoneOffset() * 60000 ) + ( 12 * 3600000 );

    this.DisplayDate = function ( XMLDOM )
    {
        var objDate = new Date();
        var nodeDate = XMLDOM.selectSingleNode( "." );
        if ( !nodeDate )
        {
            return "";
        }
        else
        {
            var strDate = nodeDate.childNodes[0].nodeValue;
            if ( strDate == "" ) { return ""; }
            strDate = parseInt( strDate ) + milliGMToffset;
            objDate.setTime( strDate );
            var intMonth = ( objDate.getMonth() ) + 1;
            var intYear = objDate.getYear();
            var intDay = objDate.getDate();
            if ( intYear < 100 )
            {
                return "" + intMonth + "-" + intDay + "-19" + intYear;
            }
            else
            {
                return "" + intMonth + "-" + intDay + "-" + intYear;
            }
        }
    }

    this.parseQueryString = function ()
    {
        var queryString = window.location.search;
        queryString = queryString.substring( 1 );
        var queryNameValuePairs = queryString.split( "&" );
        var NameValues = new Array();
        for ( var i = 0; i < queryNameValuePairs.length; i++ )
        {
            var queryNameValuePair = queryNameValuePairs[i].split( "=" );
            NameValues[unescape( queryNameValuePair[0] )] = unescape( queryNameValuePair[1] );
        }
        return NameValues;
    }

    this.ParseDelimited = function ( data, delim )
    {
        var output = new Array();
        var line = new Array();
        var offset = 0;

        var field = "";
        var lineEmpty = true;
        var maxsize = 0;
        var numfields = 0;
        var i = new Array();
        var field = "";

        // Parse lines until the eof is hit
        while ( GetNextLine() )
        {
            if ( !lineEmpty )
            {
                output.push( line );
                numfields = line.length;
                if ( numfields > maxsize )
                {
                    maxsize = numfields;
                }
            }
        }


        // If there are any lines which are shorter than the longest
        // lines, fill them out with "" entries here. This simplifies
        // checking later.
        for ( var i = 0; i < output.length; i++ )
        {
            while ( output[i].length < maxsize )
            {
                output[i].push( "" );
            }
        }

        return output;


        function GetNextLine()
        {
            line = new Array();
            //skip any empty lines
            while ( ( offset < data.length ) && ( ( data.substr( offset, 1 ) == "\r" ) || ( data.substr( offset, 1 ) == "\n" ) ) )
            {
                offset++;
            }

            if ( offset >= data.length )
            {
                return false;
            }

            lineEmpty = true;
            var moreToCome = true;
            while ( moreToCome )
            {
                moreToCome = GetNextField();
                line.push( field );
                if ( field )
                {
                    lineEmpty = false;
                }
            }
            return true;
        }

        function GetNextField()
        {
            var BEFORE_FIELD = 0;
            var IN_QUOTED_FIELD = 1;
            var IN_UNQUOTED_FIELD = 2;
            var DOUBLE_QUOTE_TEST = 3;
            var c = "";
            var state = BEFORE_FIELD;
            var p = offset;
            var endofdata = data.length;


            field = "";

            while ( true )
            {
                if ( p >= endofdata )
                {
                    // File, line and field are done
                    offset = p;
                    return false;
                }

                c = data.substr( p, 1 );

                if ( state == DOUBLE_QUOTE_TEST )
                {
                    // These checks are ordered by likelihood */
                    if ( c == delim )
                    {
                        // Field is done; delimiter means more to come
                        offset = p + 1;
                        return true;
                    }
                    else
                    {
                        if ( c == "\n" || c == "\r" )
                        {
                            // Line and field are done
                            offset = p + 1;
                            return false;
                        }
                        else
                        {
                            if ( c == '"' )
                            {
                                // It is doubled, so append one quote
                                field += '"';
                                p++;
                                state = IN_QUOTED_FIELD;
                            }
                            else
                            {
                                // !!! Shouldn't have anything else after an end quote!
                                // But do something reasonable to recover: go into unquoted mode
                                field += c;
                                p++;
                                state = IN_UNQUOTED_FIELD;
                            }
                        }
                    }
                }
                else
                {
                    if ( state == BEFORE_FIELD )
                    {
                        // These checks are ordered by likelihood */
                        if ( c == delim )
                        {
                            // Field is blank; delimiter means more to come
                            offset = p + 1;
                            return true;
                        }
                        else
                        {
                            if ( c == '"' )
                            {
                                // Found the beginning of a quoted field
                                p++;
                                state = IN_QUOTED_FIELD;
                            }
                            else
                            {
                                if ( c == "\n" || c == "\r" )
                                {
                                    // Field is blank and line is done
                                    offset = p + 1;
                                    return false;
                                }
                                else
                                {
                                    if ( c == ' ' )
                                    {
                                        // Ignore leading spaces
                                        p++;
                                    }
                                    else
                                    {
                                        // Found some other character, beginning an unquoted field
                                        field += c;
                                        p++;
                                        state = IN_UNQUOTED_FIELD;
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        if ( state == IN_UNQUOTED_FIELD )
                        {
                            // These checks are ordered by likelihood */
                            if ( c == delim )
                            {
                                // Field is done; delimiter means more to come
                                offset = p + 1;
                                return true;
                            }
                            else
                            {
                                if ( c == "\n" || c == "\r" )
                                {
                                    // Line and field are done
                                    offset = p + 1;
                                    return false;
                                }
                                else
                                {
                                    // Found some other character, add it to the field
                                    field += c;
                                    p++;
                                }
                            }
                        }
                        else
                        {
                            if ( state == IN_QUOTED_FIELD )
                            {
                                if ( c == '"' )
                                {
                                    p++;
                                    state = DOUBLE_QUOTE_TEST;
                                }
                                else
                                {
                                    // Found some other character, add it to the field
                                    field += c;
                                    p++;
                                }
                            }
                        }
                    }
                }
            }
        }

    }

}
(function()
{
    function h(a) { throw a; } var i = void 0, j = !0, k = null, l = !1; function m(a) { return function() { return this[a] } } function aa(a) { return function() { return a } } var n = this; function p(a) { return "string" == typeof a } Math.floor(2147483648 * Math.random()).toString(36); function q(a) { var b = t; function c() { } c.prototype = b.prototype; a.t = b.prototype; a.prototype = new c }; var u, ba, ca, da; function ea() { return n.navigator ? n.navigator.userAgent : k } da = ca = ba = u = l; var fa; if(fa = ea()) { var ga = n.navigator; u = 0 == fa.indexOf("Opera"); ba = !u && -1 != fa.indexOf("MSIE"); ca = !u && -1 != fa.indexOf("WebKit"); da = !u && !ca && "Gecko" == ga.product } var w = ba, ha = da, ia = ca, ja;
    a: { var ka = "", y; if(u && n.opera) var la = n.opera.version, ka = "function" == typeof la ? la() : la; else if(ha ? y = /rv\:([^\);]+)(\)|;)/ : w ? y = /MSIE\s+([^\);]+)(\)|;)/ : ia && (y = /WebKit\/(\S+)/), y) var ma = y.exec(ea()), ka = ma ? ma[1] : ""; if(w) { var na, oa = n.document; na = oa ? oa.documentMode : i; if(na > parseFloat(ka)) { ja = String(na); break a } } ja = ka } var pa = ja, qa = {};
    function ra(a)
    {
        if(!qa[a])
        {
            for(var b = 0, c = String(pa).replace(/^[\s\xa0]+|[\s\xa0]+$/g, "").split("."), d = String(a).replace(/^[\s\xa0]+|[\s\xa0]+$/g, "").split("."), e = Math.max(c.length, d.length), f = 0; 0 == b && f < e; f++)
            {
                var g = c[f] || "", r = d[f] || "", v = RegExp("(\\d*)(\\D*)", "g"), J = RegExp("(\\d*)(\\D*)", "g"); do
                {
                    var s = v.exec(g) || ["", "", ""], x = J.exec(r) || ["", "", ""]; if(0 == s[0].length && 0 == x[0].length) break; b = ((0 == s[1].length ? 0 : parseInt(s[1], 10)) < (0 == x[1].length ? 0 : parseInt(x[1], 10)) ? -1 : (0 == s[1].length ? 0 : parseInt(s[1], 10)) >
                    (0 == x[1].length ? 0 : parseInt(x[1], 10)) ? 1 : 0) || ((0 == s[2].length) < (0 == x[2].length) ? -1 : (0 == s[2].length) > (0 == x[2].length) ? 1 : 0) || (s[2] < x[2] ? -1 : s[2] > x[2] ? 1 : 0)
                } while(0 == b)
            } qa[a] = 0 <= b
        }
    } var sa = {}; function z(a) { return sa[a] || (sa[a] = w && !!document.documentMode && document.documentMode >= a) }; function A(a, b, c) { this.a = a; this.b = b || 1; this.d = c || 1 }; var B = Array.prototype, ta = B.indexOf ? function(a, b, c) { return B.indexOf.call(a, b, c) } : function(a, b, c) { c = c == k ? 0 : 0 > c ? Math.max(0, a.length + c) : c; if(p(a)) return !p(b) || 1 != b.length ? -1 : a.indexOf(b, c); for(; c < a.length; c++) if(c in a && a[c] === b) return c; return -1 }, C = B.forEach ? function(a, b, c) { B.forEach.call(a, b, c) } : function(a, b, c) { for(var d = a.length, e = p(a) ? a.split("") : a, f = 0; f < d; f++) f in e && b.call(c, e[f], f, a) }, ua = B.filter ? function(a, b, c) { return B.filter.call(a, b, c) } : function(a, b, c)
    {
        for(var d = a.length, e = [], f = 0, g = p(a) ? a.split("") :
        a, r = 0; r < d; r++) if(r in g) { var v = g[r]; b.call(c, v, r, a) && (e[f++] = v) } return e
    }; function va(a, b, c) { if(a.reduce) return a.reduce(b, c); var d = c; C(a, function(c, f) { d = b.call(i, d, c, f, a) }); return d } var wa = B.some ? function(a, b, c) { return B.some.call(a, b, c) } : function(a, b, c) { for(var d = a.length, e = p(a) ? a.split("") : a, f = 0; f < d; f++) if(f in e && b.call(c, e[f], f, a)) return j; return l }; function xa(a) { return B.concat.apply(B, arguments) } function ya(a, b, c) { return 2 >= arguments.length ? B.slice.call(a, b) : B.slice.call(a, b, c) }; !w || z(9); !ha && !w || w && z(9) || ha && ra("1.9.1"); w && ra("9"); function za(a, b) { if(a.contains && 1 == b.nodeType) return a == b || a.contains(b); if("undefined" != typeof a.compareDocumentPosition) return a == b || Boolean(a.compareDocumentPosition(b) & 16); for(; b && a != b;) b = b.parentNode; return b == a }
    function Aa(a, b)
    {
        if(a == b) return 0; if(a.compareDocumentPosition) return a.compareDocumentPosition(b) & 2 ? 1 : -1; if(w && !z(9)) { if(9 == a.nodeType) return -1; if(9 == b.nodeType) return 1 } if("sourceIndex" in a || a.parentNode && "sourceIndex" in a.parentNode) { var c = 1 == a.nodeType, d = 1 == b.nodeType; if(c && d) return a.sourceIndex - b.sourceIndex; var e = a.parentNode, f = b.parentNode; return e == f ? Ba(a, b) : !c && za(e, b) ? -1 * Ca(a, b) : !d && za(f, a) ? Ca(b, a) : (c ? a.sourceIndex : e.sourceIndex) - (d ? b.sourceIndex : f.sourceIndex) } d = 9 == a.nodeType ? a : a.ownerDocument ||
        a.document; c = d.createRange(); c.selectNode(a); c.collapse(j); d = d.createRange(); d.selectNode(b); d.collapse(j); return c.compareBoundaryPoints(n.Range.START_TO_END, d)
    } function Ca(a, b) { var c = a.parentNode; if(c == b) return -1; for(var d = b; d.parentNode != c;) d = d.parentNode; return Ba(d, a) } function Ba(a, b) { for(var c = b; c = c.previousSibling;) if(c == a) return -1; return 1 }; var D = w && !z(9), Da = w && !z(8); function E(a, b, c, d) { this.a = a; this.nodeName = c; this.nodeValue = d; this.nodeType = 2; this.parentNode = this.ownerElement = b } function Ea(a, b) { var c = Da && "href" == b.nodeName ? a.getAttribute(b.nodeName, 2) : b.nodeValue; return new E(b, a, b.nodeName, c) }; function Fa(a) { this.b = a; this.a = 0 } var Ga = RegExp("\\$?(?:(?![0-9-])[\\w-]+:)?(?![0-9-])[\\w-]+|\\/\\/|\\.\\.|::|\\d+(?:\\.\\d*)?|\\.\\d+|\"[^\"]*\"|'[^']*'|[!<>]=|\\s+|.", "g"), Ha = /^\s/; function F(a, b) { return a.b[a.a + (b || 0)] } function G(a) { return a.b[a.a++] }; function H(a) { var b = k, c = a.nodeType; 1 == c && (b = a.textContent, b = b == i || b == k ? a.innerText : b, b = b == i || b == k ? "" : b); if("string" != typeof b) if(D && "title" == a.nodeName.toLowerCase() && 1 == c) b = a.text; else if(9 == c || 1 == c) for(var a = 9 == c ? a.documentElement : a.firstChild, c = 0, d = [], b = ""; a;) { do 1 != a.nodeType && (b += a.nodeValue), D && "title" == a.nodeName.toLowerCase() && (b += a.text), d[c++] = a; while(a = a.firstChild); for(; c && !(a = d[--c].nextSibling) ;); } else b = a.nodeValue; return "" + b }
    function I(a, b, c) { if(b === k) return j; try { if(!a.getAttribute) return l } catch(d) { return l } Da && "class" == b && (b = "className"); return c == k ? !!a.getAttribute(b) : a.getAttribute(b, 2) == c } function Ia(a, b, c, d, e) { return (D ? Ja : Ka).call(k, a, b, p(c) ? c : k, p(d) ? d : k, e || new K) }
    function Ja(a, b, c, d, e) { if(a instanceof L || 8 == a.b || c && a.b === k) { var f = b.all; if(!f) return e; a = La(a); if("*" != a && (f = b.getElementsByTagName(a), !f)) return e; if(c) { for(var g = [], r = 0; b = f[r++];) I(b, c, d) && g.push(b); f = g } for(r = 0; b = f[r++];) ("*" != a || "!" != b.tagName) && M(e, b); return e } Ma(a, b, c, d, e); return e }
    function Ka(a, b, c, d, e) { b.getElementsByName && d && "name" == c && !w ? (b = b.getElementsByName(d), C(b, function(b) { a.a(b) && M(e, b) })) : b.getElementsByClassName && d && "class" == c ? (b = b.getElementsByClassName(d), C(b, function(b) { b.className == d && a.a(b) && M(e, b) })) : a instanceof N ? Ma(a, b, c, d, e) : b.getElementsByTagName && (b = b.getElementsByTagName(a.d()), C(b, function(a) { I(a, c, d) && M(e, a) })); return e }
    function Na(a, b, c, d, e) { var f; if((a instanceof L || 8 == a.b || c && a.b === k) && (f = b.childNodes)) { var g = La(a); if("*" != g && (f = ua(f, function(a) { return a.tagName && a.tagName.toLowerCase() == g }), !f)) return e; c && (f = ua(f, function(a) { return I(a, c, d) })); C(f, function(a) { ("*" != g || "!" != a.tagName && !("*" == g && 1 != a.nodeType)) && M(e, a) }); return e } return Oa(a, b, c, d, e) } function Oa(a, b, c, d, e) { for(b = b.firstChild; b; b = b.nextSibling) I(b, c, d) && a.a(b) && M(e, b); return e }
    function Ma(a, b, c, d, e) { for(b = b.firstChild; b; b = b.nextSibling) I(b, c, d) && a.a(b) && M(e, b), Ma(a, b, c, d, e) } function La(a) { if(a instanceof N) { if(8 == a.b) return "!"; if(a.b === k) return "*" } return a.d() }; function K() { this.b = this.a = k; this.i = 0 } function Pa(a) { this.b = a; this.a = this.d = k } function Qa(a, b) { if(a.a) { if(!b.a) return a } else return b; for(var c = a.a, d = b.a, e = k, f = k, g = 0; c && d;) c.b == d.b || c.b instanceof E && d.b instanceof E && c.b.a == d.b.a ? (f = c, c = c.a, d = d.a) : 0 < Aa(c.b, d.b) ? (f = d, d = d.a) : (f = c, c = c.a), (f.d = e) ? e.a = f : a.a = f, e = f, g++; for(f = c || d; f;) f.d = e, e = e.a = f, g++, f = f.a; a.b = e; a.i = g; return a } function Ra(a, b) { var c = new Pa(b); c.a = a.a; a.b ? a.a.d = c : a.a = a.b = c; a.a = c; a.i++ }
    function M(a, b) { var c = new Pa(b); c.d = a.b; a.a ? a.b.a = c : a.a = a.b = c; a.b = c; a.i++ } function Sa(a) { return (a = a.a) ? a.b : k } function Ta(a) { return (a = Sa(a)) ? H(a) : "" } function O(a, b) { return new Ua(a, !!b) } function Ua(a, b) { this.d = a; this.b = (this.c = b) ? a.b : a.a; this.a = k } function P(a) { var b = a.b; if(b == k) return k; var c = a.a = b; a.b = a.c ? b.d : b.a; return c.b }; function t(a) { this.g = a; this.b = this.f = l; this.d = k } function Q(a, b) { var c = a.a(b); return c instanceof K ? +Ta(c) : +c } function R(a, b) { var c = a.a(b); return c instanceof K ? Ta(c) : "" + c } function S(a, b) { var c = a.a(b); return c instanceof K ? !!c.i : !!c }; function Va(a, b, c) { t.call(this, a.g); this.c = a; this.e = b; this.j = c; this.f = b.f || c.f; this.b = b.b || c.b; this.c == Wa && (!c.b && !c.f && 4 != c.g && 0 != c.g && b.d ? this.d = { name: b.d.name, l: c } : !b.b && (!b.f && 4 != b.g && 0 != b.g && c.d) && (this.d = { name: c.d.name, l: b })) } q(Va);
    function T(a, b, c, d, e)
    {
        var b = b.a(d), c = c.a(d), f; if(b instanceof K && c instanceof K) { f = O(b); for(b = P(f) ; b; b = P(f)) { e = O(c); for(d = P(e) ; d; d = P(e)) if(a(H(b), H(d))) return j } return l } if(b instanceof K || c instanceof K) { b instanceof K ? e = b : (e = c, c = b); e = O(e); b = typeof c; for(d = P(e) ; d; d = P(e)) { switch(b) { case "number": f = +H(d); break; case "boolean": f = !!H(d); break; case "string": f = H(d); break; default: h(Error("Illegal primitive type for comparison.")) } if(a(f, c)) return j } return l } return e ? "boolean" == typeof b || "boolean" == typeof c ?
        a(!!b, !!c) : "number" == typeof b || "number" == typeof c ? a(+b, +c) : a(b, c) : a(+b, +c)
    } Va.prototype.a = function(a) { return this.c.k(this.e, this.j, a) }; Va.prototype.toString = function(a) { var a = a || "", b = a + "binary expression: " + this.c + "\n", a = a + "  ", b = b + (this.e.toString(a) + "\n"); return b += this.j.toString(a) }; function Xa(a, b, c, d) { this.a = a; this.p = b; this.g = c; this.k = d } Xa.prototype.toString = m("a"); var Ya = {};
    function U(a, b, c, d) { a in Ya && h(Error("Binary operator already created: " + a)); a = new Xa(a, b, c, d); return Ya[a.toString()] = a } U("div", 6, 1, function(a, b, c) { return Q(a, c) / Q(b, c) }); U("mod", 6, 1, function(a, b, c) { return Q(a, c) % Q(b, c) }); U("*", 6, 1, function(a, b, c) { return Q(a, c) * Q(b, c) }); U("+", 5, 1, function(a, b, c) { return Q(a, c) + Q(b, c) }); U("-", 5, 1, function(a, b, c) { return Q(a, c) - Q(b, c) }); U("<", 4, 2, function(a, b, c) { return T(function(a, b) { return a < b }, a, b, c) });
    U(">", 4, 2, function(a, b, c) { return T(function(a, b) { return a > b }, a, b, c) }); U("<=", 4, 2, function(a, b, c) { return T(function(a, b) { return a <= b }, a, b, c) }); U(">=", 4, 2, function(a, b, c) { return T(function(a, b) { return a >= b }, a, b, c) }); var Wa = U("=", 3, 2, function(a, b, c) { return T(function(a, b) { return a == b }, a, b, c, j) }); U("!=", 3, 2, function(a, b, c) { return T(function(a, b) { return a != b }, a, b, c, j) }); U("and", 2, 2, function(a, b, c) { return S(a, c) && S(b, c) }); U("or", 1, 2, function(a, b, c) { return S(a, c) || S(b, c) }); function Za(a, b) { b.a.length && 4 != a.g && h(Error("Primary expression must evaluate to nodeset if filter has predicate(s).")); t.call(this, a.g); this.c = a; this.e = b; this.f = a.f; this.b = a.b } q(Za); Za.prototype.a = function(a) { a = this.c.a(a); return $a(this.e, a) }; Za.prototype.toString = function(a) { var a = a || "", b = a + "Filter: \n", a = a + "  ", b = b + this.c.toString(a); return b += this.e.toString(a) }; function ab(a, b) { b.length < a.o && h(Error("Function " + a.h + " expects at least" + a.o + " arguments, " + b.length + " given")); a.n !== k && b.length > a.n && h(Error("Function " + a.h + " expects at most " + a.n + " arguments, " + b.length + " given")); a.s && C(b, function(b, d) { 4 != b.g && h(Error("Argument " + d + " to function " + a.h + " is not of type Nodeset: " + b)) }); t.call(this, a.g); this.e = a; this.c = b; this.f = a.f || wa(b, function(a) { return a.f }); this.b = a.r && !b.length || a.q && !!b.length || wa(b, function(a) { return a.b }) } q(ab);
    ab.prototype.a = function(a) { return this.e.k.apply(k, xa(a, this.c)) }; ab.prototype.toString = function(a) { var b = a || "", a = b + "Function: " + this.e + "\n", b = b + "  "; this.c.length && (a += b + "Arguments:", b += "  ", a = va(this.c, function(a, d) { return a + "\n" + d.toString(b) }, a)); return a }; function bb(a, b, c, d, e, f, g, r, v) { this.h = a; this.g = b; this.f = c; this.r = d; this.q = e; this.k = f; this.o = g; this.n = r !== i ? r : g; this.s = !!v } bb.prototype.toString = m("h"); var cb = {};
    function V(a, b, c, d, e, f, g, r) { a in cb && h(Error("Function already created: " + a + ".")); cb[a] = new bb(a, b, c, d, l, e, f, g, r) } V("boolean", 2, l, l, function(a, b) { return S(b, a) }, 1); V("ceiling", 1, l, l, function(a, b) { return Math.ceil(Q(b, a)) }, 1); V("concat", 3, l, l, function(a, b) { var c = ya(arguments, 1); return va(c, function(b, c) { return b + R(c, a) }, "") }, 2, k); V("contains", 2, l, l, function(a, b, c) { b = R(b, a); a = R(c, a); return -1 != b.indexOf(a) }, 2); V("count", 1, l, l, function(a, b) { return b.a(a).i }, 1, 1, j); V("false", 2, l, l, aa(l), 0);
    V("floor", 1, l, l, function(a, b) { return Math.floor(Q(b, a)) }, 1);
    V("id", 4, l, l, function(a, b) { function c(a) { if(D) { var b = e.all[a]; if(b) { if(b.nodeType && a == b.id) return b; if(b.length) { var c; a: { c = function(b) { return a == b.id }; for(var d = b.length, f = p(b) ? b.split("") : b, g = 0; g < d; g++) if(g in f && c.call(i, f[g])) { c = g; break a } c = -1 } return 0 > c ? k : p(b) ? b.charAt(c) : b[c] } } return k } return e.getElementById(a) } var d = a.a, e = 9 == d.nodeType ? d : d.ownerDocument, d = R(b, a).split(/\s+/), f = []; C(d, function(a) { (a = c(a)) && !(0 <= ta(f, a)) && f.push(a) }); f.sort(Aa); var g = new K; C(f, function(a) { M(g, a) }); return g },
    1); V("lang", 2, l, l, aa(l), 1); V("last", 1, j, l, function(a) { 1 != arguments.length && h(Error("Function last expects ()")); return a.d }, 0); V("local-name", 3, l, j, function(a, b) { var c = b ? Sa(b.a(a)) : a.a; return c ? c.nodeName.toLowerCase() : "" }, 0, 1, j); V("name", 3, l, j, function(a, b) { var c = b ? Sa(b.a(a)) : a.a; return c ? c.nodeName.toLowerCase() : "" }, 0, 1, j); V("namespace-uri", 3, j, l, aa(""), 0, 1, j); V("normalize-space", 3, l, j, function(a, b) { return (b ? R(b, a) : H(a.a)).replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "") }, 0, 1);
    V("not", 2, l, l, function(a, b) { return !S(b, a) }, 1); V("number", 1, l, j, function(a, b) { return b ? Q(b, a) : +H(a.a) }, 0, 1); V("position", 1, j, l, function(a) { return a.b }, 0); V("round", 1, l, l, function(a, b) { return Math.round(Q(b, a)) }, 1); V("starts-with", 2, l, l, function(a, b, c) { b = R(b, a); a = R(c, a); return 0 == b.lastIndexOf(a, 0) }, 2); V("string", 3, l, j, function(a, b) { return b ? R(b, a) : H(a.a) }, 0, 1); V("string-length", 1, l, j, function(a, b) { return (b ? R(b, a) : H(a.a)).length }, 0, 1);
    V("substring", 3, l, l, function(a, b, c, d) { c = Q(c, a); if(isNaN(c) || Infinity == c || -Infinity == c) return ""; d = d ? Q(d, a) : Infinity; if(isNaN(d) || -Infinity === d) return ""; var c = Math.round(c) - 1, e = Math.max(c, 0), a = R(b, a); if(Infinity == d) return a.substring(e); b = Math.round(d); return a.substring(e, c + b) }, 2, 3); V("substring-after", 3, l, l, function(a, b, c) { b = R(b, a); a = R(c, a); c = b.indexOf(a); return -1 == c ? "" : b.substring(c + a.length) }, 2);
    V("substring-before", 3, l, l, function(a, b, c) { b = R(b, a); a = R(c, a); a = b.indexOf(a); return -1 == a ? "" : b.substring(0, a) }, 2); V("sum", 1, l, l, function(a, b) { for(var c = O(b.a(a)), d = 0, e = P(c) ; e; e = P(c)) d += +H(e); return d }, 1, 1, j); V("translate", 3, l, l, function(a, b, c, d) { for(var b = R(b, a), c = R(c, a), e = R(d, a), a = [], d = 0; d < c.length; d++) { var f = c.charAt(d); f in a || (a[f] = e.charAt(d)) } c = ""; for(d = 0; d < b.length; d++) f = b.charAt(d), c += f in a ? a[f] : f; return c }, 3); V("true", 2, l, l, aa(j), 0); function N(a, b) { this.e = a; this.c = b !== i ? b : k; this.b = k; switch(a) { case "comment": this.b = 8; break; case "text": this.b = 3; break; case "processing-instruction": this.b = 7; break; case "node": break; default: h(Error("Unexpected argument")) } } function db(a) { return "comment" == a || "text" == a || "processing-instruction" == a || "node" == a } N.prototype.a = function(a) { return this.b === k || this.b == a.nodeType }; N.prototype.d = m("e");
    N.prototype.toString = function(a) { var a = a || "", b = a + "kindtest: " + this.e; this.c === k || (b += "\n" + this.c.toString(a + "  ")); return b }; function eb(a) { t.call(this, 3); this.c = a.substring(1, a.length - 1) } q(eb); eb.prototype.a = m("c"); eb.prototype.toString = function(a) { return (a || "") + "literal: " + this.c }; function L(a) { this.h = a.toLowerCase() } L.prototype.a = function(a) { var b = a.nodeType; if(1 == b || 2 == b) return "*" == this.h || this.h == a.nodeName.toLowerCase() ? j : this.h == (a.namespaceURI || "http://www.w3.org/1999/xhtml") + ":*" }; L.prototype.d = m("h"); L.prototype.toString = function(a) { return (a || "") + "nametest: " + this.h }; function fb(a) { t.call(this, 1); this.c = a } q(fb); fb.prototype.a = m("c"); fb.prototype.toString = function(a) { return (a || "") + "number: " + this.c }; function gb(a, b) { t.call(this, a.g); this.e = a; this.c = b; this.f = a.f; this.b = a.b; if(1 == this.c.length) { var c = this.c[0]; !c.m && c.e == hb && (c = c.j, "*" != c.d() && (this.d = { name: c.d(), l: k })) } } q(gb); function ib() { t.call(this, 4) } q(ib); ib.prototype.a = function(a) { var b = new K, a = a.a; 9 == a.nodeType ? M(b, a) : M(b, a.ownerDocument); return b }; ib.prototype.toString = function(a) { return a + "RootHelperExpr" }; function jb() { t.call(this, 4) } q(jb); jb.prototype.a = function(a) { var b = new K; M(b, a.a); return b };
    jb.prototype.toString = function(a) { return a + "ContextHelperExpr" }; gb.prototype.a = function(a) { var b = this.e.a(a); b instanceof K || h(Error("FilterExpr must evaluate to nodeset.")); for(var a = this.c, c = 0, d = a.length; c < d && b.i; c++) { var e = a[c], f = O(b, e.e.a), g; if(!e.f && e.e == kb) { for(g = P(f) ; (b = P(f)) && (!g.contains || g.contains(b)) && b.compareDocumentPosition(g) & 8; g = b); b = e.a(new A(g)) } else if(!e.f && e.e == lb) g = P(f), b = e.a(new A(g)); else { g = P(f); for(b = e.a(new A(g)) ; (g = P(f)) != k;) g = e.a(new A(g)), b = Qa(b, g) } } return b };
    gb.prototype.toString = function(a) { var b = a || "", c = b + "PathExpr:\n", b = b + "  ", c = c + this.e.toString(b); this.c.length && (c += b + "Steps:\n", b += "  ", C(this.c, function(a) { c += a.toString(b) })); return c }; function mb(a, b) { this.a = a; this.b = !!b } function $a(a, b, c) { for(c = c || 0; c < a.a.length; c++) for(var d = a.a[c], e = O(b), f = b.i, g, r = 0; g = P(e) ; r++) { var v = a.b ? f - r : r + 1; g = d.a(new A(g, v, f)); var J; "number" == typeof g ? J = v == g : "string" == typeof g || "boolean" == typeof g ? J = !!g : g instanceof K ? J = 0 < g.i : h(Error("Predicate.evaluate returned an unexpected type.")); if(!J) { v = e; g = v.d; var s = v.a; s || h(Error("Next must be called at least once before remove.")); var x = s.d, s = s.a; x ? x.a = s : g.a = s; s ? s.d = x : g.b = x; g.i--; v.a = k } } return b }
    mb.prototype.toString = function(a) { var b = a || "", a = b + "Predicates:", b = b + "  "; return va(this.a, function(a, d) { return a + "\n" + b + d.toString(b) }, a) }; function W(a, b, c, d) { t.call(this, 4); this.e = a; this.j = b; this.c = c || new mb([]); this.m = !!d; b = 0 < this.c.a.length ? this.c.a[0].d : k; a.b && b && (a = b.name, a = D ? a.toLowerCase() : a, this.d = { name: a, l: b.l }); a: { a = this.c; for(b = 0; b < a.a.length; b++) if(c = a.a[b], c.f || 1 == c.g || 0 == c.g) { a = j; break a } a = l } this.f = a } q(W);
    W.prototype.a = function(a) { var b = a.a, c = k, c = this.d, d = k, e = k, f = 0; c && (d = c.name, e = c.l ? R(c.l, a) : k, f = 1); if(this.m) if(!this.f && this.e == nb) c = Ia(this.j, b, d, e), c = $a(this.c, c, f); else if(a = O((new W(ob, new N("node"))).a(a)), b = P(a)) for(c = this.k(b, d, e, f) ; (b = P(a)) != k;) c = Qa(c, this.k(b, d, e, f)); else c = new K; else c = this.k(a.a, d, e, f); return c }; W.prototype.k = function(a, b, c, d) { a = this.e.d(this.j, a, b, c); return a = $a(this.c, a, d) };
    W.prototype.toString = function(a) { var a = a || "", b = a + "Step: \n", a = a + "  ", b = b + (a + "Operator: " + (this.m ? "//" : "/") + "\n"); this.e.h && (b += a + "Axis: " + this.e + "\n"); b += this.j.toString(a); if(this.c.length) for(var b = b + (a + "Predicates: \n"), c = 0; c < this.c.length; c++) var d = c < this.c.length - 1 ? ", " : "", b = b + (this.c[c].toString(a) + d); return b }; function pb(a, b, c, d) { this.h = a; this.d = b; this.a = c; this.b = d } pb.prototype.toString = m("h"); var qb = {};
    function X(a, b, c, d) { a in qb && h(Error("Axis already created: " + a)); b = new pb(a, b, c, !!d); return qb[a] = b } X("ancestor", function(a, b) { for(var c = new K, d = b; d = d.parentNode;) a.a(d) && Ra(c, d); return c }, j); X("ancestor-or-self", function(a, b) { var c = new K, d = b; do a.a(d) && Ra(c, d); while(d = d.parentNode); return c }, j);
    var hb = X("attribute", function(a, b) { var c = new K, d = a.d(); if("style" == d && b.style && D) return M(c, new E(b.style, b, "style", b.style.cssText)), c; var e = b.attributes; if(e) if(a instanceof N && a.b === k || "*" == d) for(var d = 0, f; f = e[d]; d++) D ? f.nodeValue && M(c, Ea(b, f)) : M(c, f); else(f = e.getNamedItem(d)) && (D ? f.nodeValue && M(c, Ea(b, f)) : M(c, f)); return c }, l), nb = X("child", function(a, b, c, d, e) { return (D ? Na : Oa).call(k, a, b, p(c) ? c : k, p(d) ? d : k, e || new K) }, l, j); X("descendant", Ia, l, j);
    var ob = X("descendant-or-self", function(a, b, c, d) { var e = new K; I(b, c, d) && a.a(b) && M(e, b); return Ia(a, b, c, d, e) }, l, j), kb = X("following", function(a, b, c, d) { var e = new K; do for(var f = b; f = f.nextSibling;) I(f, c, d) && a.a(f) && M(e, f), e = Ia(a, f, c, d, e); while(b = b.parentNode); return e }, l, j); X("following-sibling", function(a, b) { for(var c = new K, d = b; d = d.nextSibling;) a.a(d) && M(c, d); return c }, l); X("namespace", function() { return new K }, l);
    var rb = X("parent", function(a, b) { var c = new K; if(9 == b.nodeType) return c; if(2 == b.nodeType) return M(c, b.ownerElement), c; var d = b.parentNode; a.a(d) && M(c, d); return c }, l), lb = X("preceding", function(a, b, c, d) { var e = new K, f = []; do f.unshift(b); while(b = b.parentNode); for(var g = 1, r = f.length; g < r; g++) { for(var v = [], b = f[g]; b = b.previousSibling;) v.unshift(b); for(var J = 0, s = v.length; J < s; J++) b = v[J], I(b, c, d) && a.a(b) && M(e, b), e = Ia(a, b, c, d, e) } return e }, j, j);
    X("preceding-sibling", function(a, b) { for(var c = new K, d = b; d = d.previousSibling;) a.a(d) && Ra(c, d); return c }, j); var sb = X("self", function(a, b) { var c = new K; a.a(b) && M(c, b); return c }, l); function tb(a) { t.call(this, 1); this.c = a; this.f = a.f; this.b = a.b } q(tb); tb.prototype.a = function(a) { return -Q(this.c, a) }; tb.prototype.toString = function(a) { var a = a || "", b = a + "UnaryExpr: -\n"; return b += this.c.toString(a + "  ") }; function ub(a) { t.call(this, 4); this.c = a; this.f = wa(this.c, function(a) { return a.f }); this.b = wa(this.c, function(a) { return a.b }) } q(ub); ub.prototype.a = function(a) { var b = new K; C(this.c, function(c) { c = c.a(a); c instanceof K || h(Error("PathExpr must evaluate to NodeSet.")); b = Qa(b, c) }); return b }; ub.prototype.toString = function(a) { var b = a || "", c = b + "UnionExpr:\n", b = b + "  "; C(this.c, function(a) { c += a.toString(b) + "\n" }); return c.substring(0, c.length) }; function vb(a) { this.a = a } function wb(a) { for(var b, c = []; ;) { Y(a, "Missing right hand side of binary expression."); b = xb(a); var d = G(a.a); if(!d) break; var e = (d = Ya[d] || k) && d.p; if(!e) { a.a.a--; break } for(; c.length && e <= c[c.length - 1].p;) b = new Va(c.pop(), c.pop(), b); c.push(b, d) } for(; c.length;) b = new Va(c.pop(), c.pop(), b); return b } function Y(a, b) { a.a.b.length <= a.a.a && h(Error(b)) } function yb(a, b) { var c = G(a.a); c != b && h(Error("Bad token, expected: " + b + " got: " + c)) }
    function zb(a) { a = G(a.a); ")" != a && h(Error("Bad token: " + a)) } function Ab(a) { a = G(a.a); 2 > a.length && h(Error("Unclosed literal string")); return new eb(a) } function Bb(a) { return "*" != F(a.a) && ":" == F(a.a, 1) && "*" == F(a.a, 2) ? new L(G(a.a) + G(a.a) + G(a.a)) : new L(G(a.a)) }
    function Cb(a)
    {
        var b, c = [], d; if("/" == F(a.a) || "//" == F(a.a)) { b = G(a.a); d = F(a.a); if("/" == b && (a.a.b.length <= a.a.a || "." != d && ".." != d && "@" != d && "*" != d && !/(?![0-9])[\w]/.test(d))) return new ib; d = new ib; Y(a, "Missing next location step."); b = Db(a, b); c.push(b) } else {
            a: {
                b = F(a.a); d = b.charAt(0); switch(d)
                {
                    case "$": h(Error("Variable reference not allowed in HTML XPath")); case "(": G(a.a); b = wb(a); Y(a, 'unclosed "("'); yb(a, ")"); break; case '"': case "'": b = Ab(a); break; default: if(isNaN(+b)) if(!db(b) && /(?![0-9])[\w]/.test(d) &&
                    "(" == F(a.a, 1)) { b = G(a.a); b = cb[b] || k; G(a.a); for(d = []; ")" != F(a.a) ;) { Y(a, "Missing function argument list."); d.push(wb(a)); if("," != F(a.a)) break; G(a.a) } Y(a, "Unclosed function argument list."); zb(a); b = new ab(b, d) } else { b = k; break a } else b = new fb(+G(a.a))
                } "[" == F(a.a) && (d = new mb(Eb(a)), b = new Za(b, d))
            } if(b) if("/" == F(a.a) || "//" == F(a.a)) d = b; else return b; else b = Db(a, "/"), d = new jb, c.push(b)
        } for(; "/" == F(a.a) || "//" == F(a.a) ;) b = G(a.a), Y(a, "Missing next location step."), b = Db(a, b), c.push(b); return new gb(d, c)
    }
    function Db(a, b)
    {
        var c, d, e; "/" != b && "//" != b && h(Error('Step op should be "/" or "//"')); if("." == F(a.a)) return d = new W(sb, new N("node")), G(a.a), d; if(".." == F(a.a)) return d = new W(rb, new N("node")), G(a.a), d; var f; "@" == F(a.a) ? (f = hb, G(a.a), Y(a, "Missing attribute name")) : "::" == F(a.a, 1) ? (/(?![0-9])[\w]/.test(F(a.a).charAt(0)) || h(Error("Bad token: " + G(a.a))), e = G(a.a), (f = qb[e] || k) || h(Error("No axis with name: " + e)), G(a.a), Y(a, "Missing node name")) : f = nb; e = F(a.a); if(/(?![0-9])[\w]/.test(e.charAt(0))) if("(" == F(a.a,
        1)) { db(e) || h(Error("Invalid node type: " + e)); c = G(a.a); db(c) || h(Error("Invalid type name: " + c)); yb(a, "("); Y(a, "Bad nodetype"); e = F(a.a).charAt(0); var g = k; if('"' == e || "'" == e) g = Ab(a); Y(a, "Bad nodetype"); zb(a); c = new N(c, g) } else c = Bb(a); else "*" == e ? c = Bb(a) : h(Error("Bad token: " + G(a.a))); e = new mb(Eb(a), f.a); return d || new W(f, c, e, "//" == b)
    } function Eb(a) { for(var b = []; "[" == F(a.a) ;) { G(a.a); Y(a, "Missing predicate expression."); var c = wb(a); b.push(c); Y(a, "Unclosed predicate expression."); yb(a, "]") } return b }
    function xb(a) { if("-" == F(a.a)) return G(a.a), new tb(xb(a)); var b = Cb(a); if("|" != F(a.a)) a = b; else { for(b = [b]; "|" == G(a.a) ;) Y(a, "Missing next union location path."), b.push(Cb(a)); a.a.a--; a = new ub(b) } return a }; function Fb(a) { a.length || h(Error("Empty XPath expression.")); for(var a = a.match(Ga), b = 0; b < a.length; b++) Ha.test(a[b]) && a.splice(b, 1); a = new Fa(a); a.b.length <= a.a && h(Error("Invalid XPath expression.")); var c = wb(new vb(a)); a.b.length <= a.a || h(Error("Bad token: " + G(a))); this.evaluate = function(a, b) { var f = c.a(new A(a)); return new Z(f, b) } }
    function Z(a, b)
    {
        0 == b && (a instanceof K ? b = 4 : "string" == typeof a ? b = 2 : "number" == typeof a ? b = 1 : "boolean" == typeof a ? b = 3 : h(Error("Unexpected evaluation result."))); 2 != b && (1 != b && 3 != b && !(a instanceof K)) && h(Error("value could not be converted to the specified type")); this.resultType = b; var c; switch(b)
        {
            case 2: this.stringValue = a instanceof K ? Ta(a) : "" + a; break; case 1: this.numberValue = a instanceof K ? +Ta(a) : +a; break; case 3: this.booleanValue = a instanceof K ? 0 < a.i : !!a; break; case 4: case 5: case 6: case 7: var d = O(a); c = [];
                for(var e = P(d) ; e; e = P(d)) c.push(e instanceof E ? e.a : e); this.snapshotLength = a.i; this.invalidIteratorState = l; break; case 8: case 9: d = Sa(a); this.singleNodeValue = d instanceof E ? d.a : d; break; default: h(Error("Unknown XPathResult type."))
        } var f = 0; this.iterateNext = function() { 4 != b && 5 != b && h(Error("iterateNext called with wrong result type")); return f >= c.length ? k : c[f++] }; this.snapshotItem = function(a) { 6 != b && 7 != b && h(Error("snapshotItem called with wrong result type")); return a >= c.length || 0 > a ? k : c[a] }
    } Z.ANY_TYPE = 0;
    Z.NUMBER_TYPE = 1; Z.STRING_TYPE = 2; Z.BOOLEAN_TYPE = 3; Z.UNORDERED_NODE_ITERATOR_TYPE = 4; Z.ORDERED_NODE_ITERATOR_TYPE = 5; Z.UNORDERED_NODE_SNAPSHOT_TYPE = 6; Z.ORDERED_NODE_SNAPSHOT_TYPE = 7; Z.ANY_UNORDERED_NODE_TYPE = 8; Z.FIRST_ORDERED_NODE_TYPE = 9; function Gb(a) { var a = a || n, b = a.document; b.evaluate || (a.XPathResult = Z, b.evaluate = function(a, b, e, f) { return (new Fb(a)).evaluate(b, f) }, b.createExpression = function(a) { return new Fb(a) }) } var Hb = ["wgxpath", "install"], $ = n; !(Hb[0] in $) && $.execScript && $.execScript("var " + Hb[0]); for(var Ib; Hb.length && (Ib = Hb.shift()) ;) !Hb.length && Gb !== i ? $[Ib] = Gb : $ = $[Ib] ? $[Ib] : $[Ib] = {};
})()
