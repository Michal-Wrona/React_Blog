using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace React_Blog.Helpers
{
    public class SwaggerFileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var fileParameters = context.ApiDescription.ParameterDescriptions
                .Where(p => p.ModelMetadata?.ModelType == typeof(IFormFile))
                .ToList();

            if (fileParameters.Count == 0) return;

            var properties = new Dictionary<string, OpenApiSchema>();
            var required = new HashSet<string>();

            foreach (var parameter in fileParameters)
            {
                properties[parameter.Name] = new OpenApiSchema
                {
                    Type = "string",
                    Format = "binary"
                };
                required.Add(parameter.Name);
            }

            operation.RequestBody = new OpenApiRequestBody
            {
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    ["multipart/form-data"] = new OpenApiMediaType
                    {
                        Schema = new OpenApiSchema
                        {
                            Type = "object",
                            Properties = properties,
                            Required = required
                        }
                    }
                }
            };

            var fileParameterNames = fileParameters
                .Select(p => p.Name)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            var parametersToRemove = operation.Parameters
                .Where(p => fileParameterNames.Contains(p.Name))
                .ToList();

            foreach (var parameter in parametersToRemove)
                operation.Parameters.Remove(parameter);
        }
    }
}
