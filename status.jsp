<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>
<%@ page language="java" contentType="text/html; charset=iso-8859-1"
	pageEncoding="ISO-8859-1"%>
{
	"statusCode":"${code}",
	"errors":[      
      <c:forEach items="${ListError}" var="vo" varStatus="s">
			{
			"id":"${vo.id}",
			"description":"${vo.description}",
			"type":"${vo.type}",
			"field":"${vo.fieldName}",
			"typeError":"${vo.typeError}",			
			"detalleError":"${vo.detalleError}"
			}
    		 <c:if test="${!s.last}">,</c:if>
      </c:forEach>]
}
