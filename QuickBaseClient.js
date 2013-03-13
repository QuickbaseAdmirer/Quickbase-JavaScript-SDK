//QuickBase Client for JavaScript
// updated 04/18/08

function QuickBaseClient(qdbServer)
{
if(qdbServer)
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
this.errorcode="";
this.errortext="";
this.errordetail="";
this.errormessage="";
this.apptoken = "";

document.location.href.match(/\/db\/([^\?]+)\?/);
this.dbid = RegExp.$1;

  this.Authenticate = function(username, password)
      {
       this.username = username;
       this.password= password;
       this.ticket="";
       }
       
  this.GetTicket = function()
       {
       var xmlQDBRequest = this.initXMLRequest();
       xmlQDBResponse = this.APIXMLPost("main", "API_Authenticate", xmlQDBRequest);
       var newTicket = this.selectSingleNode(xmlQDBResponse, "/*/ticket");
       if(newTicket)
          {
          return this.text(newTicket);
          }
       }
   
  this.SetAppToken = function(apptoken)   
      {
         this.apptoken = apptoken;
      }
        
  this.GetSchema = function(dbid)
       {
       var xmlQDBRequest = this.initXMLRequest();
       return this.APIXMLPost(dbid, "API_GetSchema", xmlQDBRequest);
       }

  this.GetDBInfo = function(dbid)
       {
       var xmlQDBRequest = this.initXMLRequest();
       return this.APIXMLPost(dbid, "API_GetDBInfo", xmlQDBRequest);
       }

  this.CloneDatabase = function(dbid, newdbname, newdbdesc )
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "newdbname", newdbname);
       this.addParameter(xmlQDBRequest, "newdbdesc", newdbdesc );       
       xmlQDBResponse = this.APIXMLPost(dbid, "API_CloneDatabase", xmlQDBRequest);
       var newdbid = this.selectSingleNode(xmlQDBResponse, "/*/newdbid");
       if(newdbid)
          {
          return newdbid.childNodes[0].nodeValue;
          }
       return newdbid;
       }


  this.AddField = function(dbid, label, type, mode)
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "label", label);
       this.addParameter(xmlQDBRequest, "type", type);
       if(mode != "")
          {
          this.addParameter(xmlQDBRequest, "mode", mode);
          }
       var xmlQDBResponse = this.APIXMLPost(dbid, "API_AddField", xmlQDBRequest);
       var fid = this.selectSingleNode(xmlQDBResponse, "/*/fid");
       if(fid)
          {
           return fid.childNodes[0].nodeValue;
          }
       return fid;
       }

  this.DeleteField = function(dbid, fid)
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "fid", fid);
       var xmlQDBResponse = this.APIXMLPost(dbid, "API_DeleteField", xmlQDBRequest);
       return;
       }

  this.FieldAddChoices = function(dbid, fid, choiceArray)
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "fid", fid);
       for ( var choiceCounter = 0; choiceCounter < choiceArray.length; choiceCounter++ )
            {
            this.addParameter(xmlQDBRequest, "choice", choiceArray[choiceCounter]);
            }
       var xmlQDBResponse = this.APIXMLPost(dbid, "API_FieldAddChoices", xmlQDBRequest);
       var numadded = this.selectSingleNode(xmlQDBResponse, "/*/numadded");
       if(numadded)
          {
           return numadded.childNodes[0].nodeValue;
          }
       return numadded;
       }
       
  this.FieldRemoveChoices = function(dbid, fid, choiceArray)
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "fid", fid);
       for ( var choiceCounter = 0; choiceCounter < choiceArray.length; choiceCounter++ )
            {
            this.addParameter(xmlQDBRequest, "choice", choiceArray[choiceCounter]);
            }
       var xmlQDBResponse = this.APIXMLPost(dbid, "API_FieldRemoveChoices", xmlQDBRequest);
       var numremoved = this.selectSingleNode(xmlQDBResponse, "/*/numremoved");
       if(numremoved)
          {
           return numremoved.childNodes[0].nodeValue;
          }
       return numremoved;
       }
       
  this.SetFieldProperties = function(dbid, fid, propertyName, value)
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "fid", fid);
       this.addParameter(xmlQDBRequest, propertyName, value);
       return this.APIXMLPost(dbid, "API_SetFieldProperties", xmlQDBRequest);
       }

  this.GrantedDBs = function(withembeddedtables, Excludeparents, adminOnly)
    {
    var xmlQDBRequest = this.initXMLRequest();
    if(withembeddedtables != undefined)
        {
        this.addParameter(xmlQDBRequest, "withembeddedtables", withembeddedtables);
        }
    if(Excludeparents != undefined)
        {
        this.addParameter(xmlQDBRequest, "Excludeparents", Excludeparents);
        }
    if(adminOnly != undefined)
        {
        this.addParameter(xmlQDBRequest, "adminOnly", adminOnly);
        }
    return this.APIXMLPost("main", "API_GrantedDBs", xmlQDBRequest);
    }

  this.AddRecord = function(dbid, recordArray, ignoreError)
       {
       var xmlQDBRequest = this.initXMLRequest();
       for ( var fieldCounter = 0; fieldCounter < recordArray.length; fieldCounter += 2)
            {
            this.addFieldParameter(xmlQDBRequest, recordArray[fieldCounter], recordArray[fieldCounter + 1]);
            }
       if(ignoreError)
            {
            this.addParameter(xmlQDBRequest, "ignoreError", "1");
            }
       return this.APIXMLPost(dbid, "API_AddRecord", xmlQDBRequest);
       }


  this.EditRecord = function(dbid, rid, recordArray)
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "rid", rid);
       for ( var fieldCounter = 0; fieldCounter < recordArray.length; fieldCounter += 2)
           {
            this.addFieldParameter(xmlQDBRequest, recordArray[fieldCounter], recordArray[fieldCounter + 1]);
            }
       return this.APIXMLPost(dbid, "API_EditRecord", xmlQDBRequest);
        }


  this.DeleteRecord = function(dbid, rid)
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "rid", rid);
       return this.APIXMLPost(dbid, "API_DeleteRecord", xmlQDBRequest);
        }

  this.DoQuery = function(dbid, query, clist, slist, options)
       {
        return this.query(dbid, query, clist, slist, options, "structured");
       }
  
  this.DoQueryADO = function(dbid, query, clist, slist, options)
       {
        return this.query(dbid, query, clist, slist, options, "xado");
       }

  this.query = function query(dbid, query, clist, slist, options, fmt)
        {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "fmt", fmt);
       if(query.match(/^\{.*\}$/))
           {
            this.addParameter(xmlQDBRequest, "query", query);
            }
       else if(query.match(/^-?[1-9][0-9]*$/))
           {
            this.addParameter(xmlQDBRequest, "qid", query);
            }
       else
           {
            this.addParameter(xmlQDBRequest, "qname", query);
            }
       this.addParameter(xmlQDBRequest, "clist", clist);
       this.addParameter(xmlQDBRequest, "slist", slist);
       this.addParameter(xmlQDBRequest, "options", options);
       return this.APIXMLPost(dbid, "API_DoQuery", xmlQDBRequest);
        }
        
  this.PurgeRecords = function(dbid, query)
       {
       var xmlQDBRequest = this.initXMLRequest();
       this.addParameter(xmlQDBRequest, "query", query);
       return this.APIXMLPost(dbid, "API_PurgeRecords", xmlQDBRequest);
        }
        
   this.ImportFromCSV = function(dbid, CSV, clist, rids, skipfirst)
       {
        var xmlQDBRequest = this.initXMLRequest();
        this.addParameter(xmlQDBRequest, "clist", clist);
        this.addParameter(xmlQDBRequest, "skipfirst", skipfirst);
        this.addCDATAParameter(xmlQDBRequest, "records_csv", CSV);
        var xmlQDBResponse = this.APIXMLPost(dbid, "API_ImportFromCSV", xmlQDBRequest);
        var RidNodeList = this.selectNodes(xmlQDBResponse, "/*/rids/rid");
        var ridListLength = RidNodeList.length;
        for(var i = 0; i < ridListLength; i++)
            {
             rids.push(RidNodeList[i].childNodes[0].nodeValue);
             }
        var result = this.selectSingleNode(xmlQDBResponse.documentElement, "/*/num_recs_added");
        var numrecords = 0;
        if(result)
           {
            numrecords += parseInt(result.childNodes[0].nodeValue);
            }
        result = this.selectSingleNode(xmlQDBResponse.documentElement, "/*/num_recs_updated");
        if(result)
           {
            numrecords += parseInt(result.childNodes[0].nodeValue);
            }
        return numrecords;
        }
    
    this.ListDBPages = function(dbid)
        {
        var xmlQDBRequest = this.initXMLRequest();
        return this.APIXMLPost(dbid, "API_ListDBpages", xmlQDBRequest);
        }
        
    this.GetDBPage = function(dbid, page)
        {
        var xmlQDBRequest = this.initXMLRequest();
        if(page.match(/^[1-9][0-9]*$/))
            {
            this.addParameter(xmlQDBRequest, "pageid", page);
            }
        else
            {
            this.addParameter(xmlQDBRequest, "pagename", page);
            }
        return this.APIXMLPost(dbid, "API_GetDBPage", xmlQDBRequest);
        }
    
    this.AddReplaceDBPage = function(dbid, page, pagetype, pagebody)
        {
        var xmlQDBRequest = this.initXMLRequest();
        if(page.match(/^[1-9][0-9]*$/))
            {
            this.addParameter(xmlQDBRequest, "pageid", page);
            }
        else
            {
            this.addParameter(xmlQDBRequest, "pagename", page);
            }
        this.addParameter(xmlQDBRequest, "pagetype", pagetype);
        this.addParameter(xmlQDBRequest, "pagebody", pagebody);
        return this.APIXMLPost(dbid, "API_AddReplaceDBPage", xmlQDBRequest);
        }

    /**
     * AddUserToRole: Add a user to a role in an application.
     * @param dbid The unique identifier of a QuickBase application.
     * @param userid The unique identifier of a QuickBase user.
     * @param roleid The unique identifier of a QuickBase role.
     * @return boolean
     */
    this.AddUserToRole = function(dbid,userid,roleid)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "userid", userid);
      this.addParameter(xmlQDBRequest, "roleid", roleid);
      xmlQDBResponse = this.APIXMLPost(dbid,"API_AddUserToRole",xmlQDBRequest);
      return xmlQDBResponse;
    }

   /**
     * ChangeRecordOwner: Change the owner of a record from a QuickBase table.
     * @param dbid The unique identifier of a QuickBase database.
     * @param rid String containing the record ID of the record to be deleted. 
     * @param newowner String containing the screenname or email address of the new record owner. 
     */
    this.ChangeRecordOwner = function(dbid,rid,newowner)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "rid", rid);
      this.addParameter(xmlQDBRequest, "newowner", newowner);
      xmlQDBResponse = this.APIXMLPost(dbid,"API_ChangeRecordOwner",xmlQDBRequest);
      return xmlQDBResponse;
    }

    /**
     * ChangeUserRole: Change the role of a user in a particular application.
     * @param userid The unique identifier of a QuickBase user.
     * @param roleid The unique identifier of the user's current QuickBase role.
     * @param newroleid The unique identifier of the new QuickBase role for the user.
     */
    this.ChangeUserRole = function(dbid,userid,roleid,newroleid)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "userid", userid);
      this.addParameter(xmlQDBRequest, "roleid", roleid);
      this.addParameter(xmlQDBRequest, "newroleid", newroleid);
      xmlQDBResponse = this.APIXMLPost(dbid,"API_ChangeUserRole",xmlQDBRequest);
      return xmlQDBResponse;
    }

    /**
     * CreateDatabase: Create a new application.
     * @param dbname The name of the application to create.
     * @param dbdesc The description of the application to create.
     */
    this.CreateDatabase = function(dbname,dbdesc)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "dbname", dbname);
      this.addParameter(xmlQDBRequest, "dbdesc", dbdesc);
      xmlQDBResponse = this.APIXMLPost("main","API_CreateDatabase",xmlQDBRequest);
      var newdbid = this.selectSingleNode(xmlQDBResponse, "/*/newdbid");
      if(newdbid)
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
    this.CreateTable = function(dbid,pnoun)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "pnoun", pnoun);
      xmlQDBResponse = this.APIXMLPost(dbid,"API_CreateTable",xmlQDBRequest);
      var newdbid = this.selectSingleNode(xmlQDBResponse, "/*/newdbid");
      if(newdbid)
      {
         return newdbid.childNodes[0].nodeValue;
      }
      else
     {
         newdbid = this.selectSingleNode(xmlQDBResponse, "/*/newDBID");
         if(newdbid)
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
    this.DeleteDatabase = function(dbid)
    {
      var xmlQDBRequest = this.initXMLRequest();
      xmlQDBResponse = this.APIXMLPost(dbid,"API_DeleteDatabase",xmlQDBRequest);
      return xmlQDBResponse;
    }

    /**
     * FindDBByName: Retrieve the database id associated with the database name.
     * @param dbname the complete name of a QuickBase database.
     * @return the QuickBase database ID
     */
    this.FindDBByName = function(dbname)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "dbname", dbname);
      xmlQDBResponse = this.APIXMLPost("main","API_FindDBByName",xmlQDBRequest);
      var dbid = this.selectSingleNode(xmlQDBResponse, "/*/dbid");
      if(dbid)
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
    this.GetDBvar = function(dbid,varname)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "varname", varname);
      xmlQDBResponse = this.APIXMLPost(dbid,"API_GetDBvar",xmlQDBRequest);
      var value = this.selectSingleNode(xmlQDBResponse, "/*/value");
      if(value)
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
    this.GetNumRecords = function(dbid)
    {
      var xmlQDBRequest = this.initXMLRequest();
      xmlQDBResponse = this.APIXMLPost(dbid,"API_GetNumRecords",xmlQDBRequest);
      var num_records = this.selectSingleNode(xmlQDBResponse, "/*/num_records");
      if(num_records)
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
    this.GenAddRecordForm = function(dbid,fieldvalues)
    {
       var action = "API_GenAddRecordForm";
       for ( var fieldIndex = 0; fieldIndex < fieldvalues.length; fieldIndex++ )
       {
          fieldValuePair = fieldvalues[fieldIndex].split(":");
          action = action + "&" + fieldValuePair[0] + "=" + fieldValuePair[1]
       }
      return this.GetURL(dbid,action);
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
    this.GenResultsTable = function(dbid,query,clist,slist,jht,jsa,options)
    {
      var action = "API_GenResultsTable";
      action = action + "&query=" + query;
      action = action + "&clist=" + clist;
      action = action + "&slist=" + slist;
      action = action + "&jht=" + jht;
      action = action + "&jsa="+ jsa;
      action = action + "&options=" + options;
      return this.GetURL(dbid,action);
    }

    /**
     * GetOneTimeTicket: Retrieve a ticket valid for the next 5 minutes only. Designed for uploading files.
     * @return String The ticket.
     */
    this.GetOneTimeTicket = function()
    {
      var xmlQDBRequest = this.initXMLRequest();
      xmlQDBResponse = this.APIXMLPost("main","API_GetOneTimeTicket",xmlQDBRequest);
      var ticket = this.selectSingleNode(xmlQDBResponse, "/*/ticket");
      if(ticket)
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
    this.GetRecordAsHTML = function(dbid,rid)
    {
      return this.GetURL(dbid,"API_GetRecordAsHTML&rid=" + rid);
    }
    
    /**
     * GetRecordInfo: Returns a Xml Document of all the field values of a given record.
     * @param dbid The unique identifier of a QuickBase table.
     * @param rid The unique identifier of a QuickBase record.
     * @return Document The XML document of record information.
     */
    this.GetRecordInfo = function(dbid,rid)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "rid", rid);
      xmlQDBResponse = this.APIXMLPost(dbid,"API_GetRecordInfo",xmlQDBRequest);
      return xmlQDBResponse;
    }
    
    /**
     * GetRoleInfo: Returns an Xml Document of role information for an application.
     * @param dbid The unique identifier of a QuickBase application.
     * @return Document The XML Document of role information.
     */
    this.GetRoleInfo = function(dbid)
    {
      var xmlQDBRequest = this.initXMLRequest();
      xmlQDBResponse = this.APIXMLPost(dbid,"API_GetRoleInfo",xmlQDBRequest);
      return xmlQDBResponse;
    }

    /**
     * GetUserInfo: Returns an Xml Document of information about a user.
     * @param email The email address of the user.
     * @return Document The XML Document of user information.
     */
    this.GetUserInfo = function(email)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "email", email);
      xmlQDBResponse = this.APIXMLPost("main","API_GetUserInfo",xmlQDBRequest);
      return xmlQDBResponse;
    }

    /**
     * GetUserRole: Returns an Xml Document of role information for a given user and application.
     * @param dbid The unique identifier of a QuickBase application.
     * @param userid The unique identifier of a QuickBase user.
     * @return Document The XML Document of User Role information for the specified user.
     */
    this.GetUserRole = function(dbid,userid)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "userid", userid);
      xmlQDBResponse = this.APIXMLPost(dbid,"API_GetUserRole",xmlQDBRequest);
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
    this.ProvisionUser = function(dbid,roleid,email,fname,lname)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "roleid", roleid);
      this.addParameter(xmlQDBRequest, "email", email);
      this.addParameter(xmlQDBRequest, "fname", fname);
      this.addParameter(xmlQDBRequest, "lname", lname);
      xmlQDBResponse = this.APIXMLPost(dbid,"API_ProvisionUser",xmlQDBRequest);
      var userid = this.selectSingleNode(xmlQDBResponse, "/*/userid");
      if(userid)
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
    this.RemoveUserFromRole = function(dbid,userid,roleid)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "userid", userid);
      this.addParameter(xmlQDBRequest, "roleid", roleid);
      xmlQDBResponse = this.APIXMLPost(dbid,"API_RemoveUserFromRole",xmlQDBRequest);
      return xmlQDBResponse;
    }

    /**
     * RenameApp: Change the name of an application.
     * @param dbid The unique identifier of a QuickBase application.
     * @param newappname The new name for the application.
     */
    this.RenameApp = function(dbid,newappname)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "newappname", newappname);
      xmlQDBResponse = this.APIXMLPost(dbid,"API_RenameApp",xmlQDBRequest);
      return xmlQDBResponse;
    }
    
    /**
     * SetDBvar: Set the value of an application variable.
     * @param dbid The unique identifier of a QuickBase application.
     * @param varname The name of the variable to set.
     * @param value The value to set.
     */
    this.SetDBvar = function(dbid,varname,value)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "varname", varname);
      this.addParameter(xmlQDBRequest, "value", value);
      xmlQDBResponse = this.APIXMLPost(dbid,"API_SetDBvar",xmlQDBRequest);
      return xmlQDBResponse;
    }

    /**
     * SendInvitation: Send an email from QuickBase inviting a user to an application. 
     * @param dbid The unique identifier of a QuickBase application.
     * @param userid The unique identifier of a QuickBase user.
     */
    this.SendInvitation = function(dbid,userid)
    {
      var xmlQDBRequest = this.initXMLRequest();
      this.addParameter(xmlQDBRequest, "userid", userid);
      xmlQDBResponse = this.APIXMLPost(dbid,"API_SendInvitation",xmlQDBRequest);
      return xmlQDBResponse;
    }

    /**
     * SignOut: Sign out of QuickBase explicitly. 
     * Means username and password will be used for the next API call.
     */
    this.SignOut = function()
    {
      var xmlQDBRequest = this.initXMLRequest();
      xmlQDBResponse = this.APIXMLPost("main","API_SignOut",xmlQDBRequest);
      return xmlQDBResponse;
    }
    
    /**
     * UserRoles: Returns an Xml Document of information about the roles defined for an application.
     * @param dbid The unique identifier of a QuickBase application.
     * @return Document The XML Document of all User Role information.
     */
    this.UserRoles = function(dbid)
    {
      var xmlQDBRequest = this.initXMLRequest();
      xmlQDBResponse = this.APIXMLPost(dbid,"API_UserRoles",xmlQDBRequest);
      return xmlQDBResponse;
    }

      var xmlQDBRequest;
      
      function createXMLDOM () {
        try {
            if (document.implementation && document.implementation.createDocument) {
                var doc = document.implementation.createDocument("", "", null);                 
                return doc;
            }
            if (window.ActiveXObject)
                return new ActiveXObject("Microsoft.XmlDom");
        }
        catch (ex) {}
        throw new Error("Sorry. Your browser does not support QuickBaseClient.js.");
        };
        
      this.initXMLRequest = function()
       {
        xmlQDBRequest = createXMLDOM();
        xmlQDBRequest.async = false;
        xmlQDBRequest.resolveExternals = false;

        var root = xmlQDBRequest.createElement("qdbapi");
        try{
        xmlQDBRequest.removeChild(xmlQDBRequest.documentElement);
        }
    catch(e)
        {
        }
        xmlQDBRequest.appendChild(root);

        if (!this.ticket)
            {
             if(this.username)
                 {
                 this.addParameter(xmlQDBRequest, "username", this.username);
                 this.addParameter(xmlQDBRequest, "password", this.password); 
                  }
            }
       else
            {
             this.addParameter(xmlQDBRequest, "ticket", this.ticket);
             }
        if(this.apptoken)
          {
             this.addParameter(xmlQDBRequest, "apptoken", this.apptoken);
          }          
             
        return xmlQDBRequest;
        }

   this.addParameter = function(xmlQDBRequest, Name, Value)
        {
         var Root = xmlQDBRequest.documentElement;
         var ElementNode = xmlQDBRequest.createElement(Name);
         var TextNode = xmlQDBRequest.createTextNode(Value);
         ElementNode.appendChild(TextNode);
         Root.appendChild(ElementNode);
        }

 this.addFieldParameter = function(xmlQDBRequest, fieldName, Value)
        {
         var Root = xmlQDBRequest.documentElement;
         var ElementNode = xmlQDBRequest.createElement("field");
         var attrField;
         if(fieldName.match(/^[1-9]\d*$/))
             {
              ElementNode.setAttribute("fid", fieldName)
              }
         else
              {
          fieldName = fieldName.replace(/[^a-z0-9]/ig, "_").toLowerCase();
              ElementNode.setAttribute("name", fieldName)
            }
         var TextNode = xmlQDBRequest.createTextNode(Value);
         ElementNode.appendChild(TextNode);
         Root.appendChild(ElementNode);
        }

   this.addCDATAParameter = function(xmlQDBRequest, Name, Value)
        {
         var Root = xmlQDBRequest.documentElement;
         var ElementNode = xmlQDBRequest.createElement(Name);
         var CDATANode = xmlQDBRequest.createCDATASection(Value);
         ElementNode.appendChild(CDATANode);
         Root.appendChild(ElementNode);
        }
        
      var xmlHTTPPost;
   XMLhttpInit();
   
   function XMLhttpInit()
        {
        try {
            if (!xmlHTTPPost)
                xmlHTTPPost = new XMLHttpRequest();
            }
        catch(e)
            {
            }
        try {
            if (!xmlHTTPPost)
                xmlHTTPPost = new ActiveXObject("Msxml2.XMLHTTP");
            }
        catch(e)
            {
            }
        try {
            if (!xmlHTTPPost)
                xmlHTTPPost = new ActiveXObject("Microsoft.XMLHTTP");
            }
        catch(e)
            {
            alert("Sorry. This browser does not support QuickBaseClient.");
            }

        }
        
   this.APIXMLPost = function(dbid, action, xmlQDBRequest)
       {
       var script;
       script = this.qdbServer + "/db/" + dbid + "?act=" + action;
       xmlHTTPPost.open("POST", script, false);
       xmlHTTPPost.setRequestHeader("Content-Type","text/xml");
       xmlHTTPPost.send(xmlQDBRequest);
       var xmlAPI = xmlHTTPPost.responseXML;
       var topLevelChildren = xmlAPI.documentElement.childNodes;
       this.errorcode = "";
       this.errortext = "";
       this.errordetail = "";
       this.errormessage = "";
       for (var i = 0; i < topLevelChildren.length; i++) 
        {
        if(topLevelChildren[i].nodeName == "ticket")
        {
        this.ticket = topLevelChildren[i].childNodes[0].nodeValue;
        }
        if(topLevelChildren[i].nodeName == "errcode")
        {
        this.errorcode = topLevelChildren[i].childNodes[0].nodeValue;
        }
        if(topLevelChildren[i].nodeName == "errtext")
        {
        this.errortext = topLevelChildren[i].childNodes[0].nodeValue;
        this.errordetail += topLevelChildren[i].childNodes[0].nodeValue;
        }
        if(topLevelChildren[i].nodeName == "errdetail")
        {
        this.errordetail += "\r\n" + topLevelChildren[i].childNodes[0].nodeValue;
        this.errormessage = "\r\n\r\n" + this.errordetail;
        }           
            }
       return xmlAPI;
       }

this.xpe = null;
this.nsResolver = null;

this.selectSingleNode = function (aNode, aExpr)
    {
    if((typeof aNode.selectSingleNode) != "undefined")
        {
        return aNode.selectSingleNode(aExpr);
        }
    if(this.xpe == null)
        {    
        this.xpe = new XPathEvaluator();
        }
    this.nsResolver = this.xpe.createNSResolver(aNode.ownerDocument == null ? aNode.documentElement : aNode.ownerDocument.documentElement);
    var result = this.xpe.evaluate(aExpr, aNode, this.nsResolver, 0, null);
    return result.iterateNext();
    }

this.selectNodes = function (aNode, aExpr)
    {
    if((typeof aNode.selectNodes) != "undefined")
        {
        return aNode.selectNodes(aExpr);
        }
    if(this.xpe == null)
        {    
        this.xpe = new XPathEvaluator();
        }
    this.nsResolver = this.xpe.createNSResolver(aNode.ownerDocument == null ? aNode.documentElement : aNode.ownerDocument.documentElement);
    var result = this.xpe.evaluate(aExpr, aNode, this.nsResolver, 0, null);
    var found = [];
    while (res = result.iterateNext())
            {
        found.push(res);
            }
    return found;
    }

this.text = function(aNode)
    {
    if((typeof aNode.text) != "undefined")
        {
        return aNode.text;
        }
    var nodetext = "";
    for(var i = 0; i < aNode.childNodes.length; i++)
        { 
        if(aNode.childNodes[i].nodeValue != null)
        {
        nodetext += aNode.childNodes[i].nodeValue;
        }
        }
    return nodetext;
    }

this.GetURL = function(dbid, action)
       {
       var script;
       script = this.qdbServer + "/db/" + dbid + "?act=" + action + "&apptoken=" + this.apptoken;
       xmlHTTPPost.open("GET", script, false);
       xmlHTTPPost.send(null);
       return xmlHTTPPost.responseText; 
       }


   this.displayErrorAlert = function(message)
       {
        if(this.errorcode != '0')
            {
            alert(message + " " + this.errormessage);
            return true;
            }
        else
            {
            return false;
            }
        }
    
    this.HTTPPost = function(dbid, querystring, content, contentType)
        {
        var script;
        var xmlHTTPPost = new ActiveXObject("Microsoft.XMLHTTP");
        script = this.qdbServer + "/db/" + dbid + "?" + querystring;
        xmlHTTPPost.open("POST", script, false);
        xmlHTTPPost.setRequestHeader("Content-Type",contentType);
        xmlHTTPPost.send(content);
        return xmlHTTPPost.responseText;
        }
    
    
monthNames = new Array(12)
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

dayNames = new Array(7)
dayNames[1] = "Sunday"
dayNames[2] = "Monday"
dayNames[3] = "Tuesday"
dayNames[4] = "Wednesday"
dayNames[5] = "Thursday"
dayNames[6] = "Friday"
dayNames[7] = "Saturday"

    this.format = function(data, format)
        {
        if(format.match(/^date/i))
            {
            var intData = parseInt(data);
            var objGMTDate = new Date(intData);
            var milliGMToffset = objGMTDate.getTimezoneOffset()*60000;
            var oneDate = new Date(intData+ milliGMToffset);
            var date = oneDate.getDate();
            var day = oneDate.getDay() + 1;
            var month = oneDate.getMonth() + 1;
            var theYear = oneDate.getYear();
            if(theYear < 1900)
                {
                theYear += 1900;
                }
            if(format.match(/friend/i))
                {
                return monthNames[month] + " " + date + ", " + theYear;
                }
            if(format.match(/long/i))
                {
                return dayNames[day] + ", " + monthNames[month] + " " + date + ", " + theYear;
                }
            else if(format.match(/timestamp/i))
                {
                    return oneDate.toLocaleString();
                    }
            else
                {
                return month + "-" + date + "-" + theYear;
                }
            }
        if(format.match(/^timeofday/))
           {
            data = parseInt(data);
            var intHours=Math.floor(data/3600000);
            var intMinutes=Math.floor(data/60000)%60;
            if (intMinutes < 10){intMinutes="0"+intMinutes;}
            return ""+intHours+":"+intMinutes;
            }
        }

    var objGMTDate = new Date();
    var milliGMToffset=(objGMTDate.getTimezoneOffset()*60000)+(12*3600000);
        
        this.DisplayDate = function(XMLDOM)
            {
            var objDate=new Date();
            var nodeDate = XMLDOM.selectSingleNode(".");
            if (!nodeDate)
                {
                return "";
                }
            else
                {
                var strDate = nodeDate.childNodes[0].nodeValue;
                if(strDate==""){return "";}
                strDate = parseInt(strDate) + milliGMToffset;
                objDate.setTime(strDate);
                var intMonth=(objDate.getMonth())+1;
                var intYear=objDate.getYear();
                var intDay=objDate.getDate();
                if (intYear <100)
                    {
                    return ""+intMonth+"-"+intDay+"-19"+intYear;
                    }
                else
                    {   
                    return ""+intMonth+"-"+intDay+"-"+intYear;
                    }
                }
            }

this.parseQueryString = function()
{
var queryString = window.location.search;
    queryString = queryString.substring(1);
    var queryNameValuePairs = queryString.split("&");
    var NameValues = new Array();
    for (var i = 0; i < queryNameValuePairs.length; i++)
         {
          var queryNameValuePair = queryNameValuePairs[i].split("=");
          NameValues[unescape(queryNameValuePair[0])] = unescape(queryNameValuePair[1]);          
          }
return NameValues;
}
        
this.ParseDelimited = function(data, delim)
   {
      var output = new Array();
      var line = new Array();
      var offset = 0;
      
      var field="";
      var lineEmpty=true;
      var maxsize = 0;
      var numfields=0;
      var i = new Array();
      var field = "";
      
      // Parse lines until the eof is hit
      while (GetNextLine())
         {
            if(!lineEmpty)
               {
                  output.push(line);
                  numfields=line.length;
                  if (numfields > maxsize)
                     {
                        maxsize = numfields;
                     }
               }
         }
         
      
      // If there are any lines which are shorter than the longest
      // lines, fill them out with "" entries here. This simplifies
      // checking later.
      for (var i = 0; i < output.length; i++)
         {
            while (output[i].length < maxsize)
               {
                  output[i].push ("");
               }
         }
         
      return output;


function GetNextLine()
   {
      line = new Array();
      //skip any empty lines
      while ((offset < data.length) && ((data.substr(offset, 1) == "\r") || (data.substr(offset, 1) == "\n")))
         {
            offset++;
            }   
               
            if (offset >= data.length)
               {
                  return false;
               }
               
            lineEmpty = true;
            var moreToCome =true;
            while(moreToCome)
               {
                  moreToCome = GetNextField();
                  line.push(field);
                  if (field)
                     {
                        lineEmpty = false;
                     }
               }
            return true;
         }
      
function GetNextField()
         {
            var BEFORE_FIELD=0;
            var IN_QUOTED_FIELD=1;
            var IN_UNQUOTED_FIELD=2;
            var DOUBLE_QUOTE_TEST=3;
            var c="";
            var state = BEFORE_FIELD;
            var p = offset;
            var endofdata = data.length;
            
               
            field = "";
               
            while (true)
               {
                  if (p >= endofdata)
                     {
                        // File, line and field are done
                        offset = p;
                        return false;
                     }
                  
                  c = data.substr(p, 1);
                     
                  if(state == DOUBLE_QUOTE_TEST)
                     {
                        // These checks are ordered by likelihood */
                        if (c == delim)
                           {
                              // Field is done; delimiter means more to come
                              offset = p + 1;
                              return true;
                           }
                        else
                           {
                              if (c == "\n" || c == "\r")
                                 {
                                    // Line and field are done
                                    offset = p + 1;
                                    return false;
                                 }
                                 else
                                 {
                                    if (c == '"')
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
                              if(state == BEFORE_FIELD)
                                 {
                                    // These checks are ordered by likelihood */
                                    if (c == delim)
                                       {
                                          // Field is blank; delimiter means more to come
                                          offset = p + 1;
                                          return true;
                                       }
                                    else
                                       {
                                          if (c == '"')
                                             {
                                                // Found the beginning of a quoted field
                                                p++;
                                                state = IN_QUOTED_FIELD;
                                             }
                                          else
                                             {
                                                if (c == "\n" || c == "\r")
                                                   {
                                                      // Field is blank and line is done
                                                      offset = p + 1;
                                                      return false;
                                                   }
                                                else
                                                     {
                                                      if (c == ' ')
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
                                    if (state == IN_UNQUOTED_FIELD)
                                       {
                                          // These checks are ordered by likelihood */
                                          if (c == delim)
                                             {
                                                // Field is done; delimiter means more to come
                                                offset = p + 1;
                                                return true;
                                             }
                                          else
                                             {
                                                if (c == "\n" || c == "\r")
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
                                          if(state == IN_QUOTED_FIELD)
                                             {
                                                if (c == '"')
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
