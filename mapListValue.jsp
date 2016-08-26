<%@ page import="java.util.Iterator" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.Set" %>
{
	<%Map mapaP = (Map) request.getAttribute("datos");
	if(mapaP != null){
		Iterator campIt = mapaP.entrySet().iterator();
		while(campIt.hasNext()){
			Map.Entry<String,Object> entry = (Map.Entry<String,Object>) campIt.next();
			%>
			"<%=entry.getKey()%>":[
					<%	List data = (List) entry.getValue();
						if (data != null) {
							for (Iterator rowIt = data.iterator(); rowIt.hasNext();) {
								Map row = (Map) rowIt.next();
					%>
					{
					<%			Set keys = row.keySet();
								for (Iterator fieldIt = keys.iterator(); fieldIt.hasNext();) {
									Object key = fieldIt.next();
									Object value = null;
									value  = row.get(key);
									if (value == null) value = "";
										
					%>
						"<%= key.toString().replaceAll("\\\\", "\\\\\\\\").replaceAll("\\\"", "\\\\\"") %>":"<%= value.toString().replaceAll("\\\\", "\\\\\\\\").replaceAll("\\\"", "\\\\\"").replaceAll("(\r\n|\n\r|\r|\n)", "\\\\r") %>"<%= fieldIt.hasNext() ? "," : "" %>
					<%			}
					%>
					}<%= rowIt.hasNext() ? "," : "" %>
					<%		}
						}
					%>]
			<%=campIt.hasNext() ? "," : "" %><%
		}
	}
	%>
}