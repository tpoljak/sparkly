app.factory('ComponentMetadata', function($http, PropertyMetadata, StreamMetadata) {

    function ComponentMetadata(id, name, description, category, properties, inputs, outputs) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.properties = properties;
        this.inputs = inputs;
        this.outputs = outputs;
    };

    ComponentMetadata.prototype.property = function(name) {
        return $.grep(this.properties, function (property) { return property.name == name })[0]
    };

    ComponentMetadata.prototype.inputStream = function(name) {
        return $.grep(this.inputs, function (inputStream) { return inputStream.name == name })[0]
    };

    ComponentMetadata.prototype.outputStream = function(name) {
        return $.grep(this.outputs, function (outputStream) { return outputStream.name == name })[0]
    };

    ComponentMetadata.build = function (data) {
        return new ComponentMetadata(
            data.id,
            data.name,
            data.description,
            data.category,
            data.properties.map(PropertyMetadata.build),
            data.inputs.map(StreamMetadata.build),
            data.outputs.map(StreamMetadata.build)
        );
    };

    ComponentMetadata.findAll = function() {
        return $http.get('api/components/').then(function(componentsData) {
            return $.map(componentsData.data, ComponentMetadata.build);
        });
    };

    return ComponentMetadata;
});

app.factory('Component', function($http, ComponentMetadata, Property, Stream) {

	function Component(metadata, id, name, inputs, outputs, properties, x, y) {
		this.metadata = metadata;

		this.id = id;
		this.name = name;

		this.inputs = inputs;
		this.outputs = outputs;
		this.properties = properties;

		this.x = x;
		this.y = y;
	};

	Component.build = function (data) {
	    var metadata = ComponentMetadata.build(data.metadata);

        var outputs = metadata.outputs.map(function(streamMetadata) {
            var streamData = data.outputs.tryFind(function(output){return output.name == streamMetadata.name});
            return streamData == null ? Stream.newStream(streamMetadata) : Stream.build(streamMetadata, streamData);
        });

        var inputs = metadata.inputs.map(function(streamMetadata) {
            var streamData = data.inputs.tryFind(function(input){return input.name == streamMetadata.name});
            return streamData == null ? Stream.newStream(streamMetadata) : Stream.build(streamMetadata, streamData);
        });

        var properties = metadata.properties.map(function(propertyMetadata) {
            var propertyData = data.properties.tryFind(function(property){return property.name == propertyMetadata.name});
            return propertyData == null ? Property.newProperty(propertyMetadata) : Property.build(propertyMetadata, propertyData);
        });

        return new Component(metadata, data.id, data.name, inputs, outputs, properties, data.x, data.y);
    };

    Component.newComponent = function(metadata) {
        var id = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
        var name = metadata.name;
        var inputs = metadata.inputs.map(Stream.newStream)
        var outputs = metadata.outputs.map(Stream.newStream)
        var properties = metadata.properties.map(Property.newProperty)

        return new Component(metadata, id, name, inputs, outputs, properties, 50, 50);
    };

    Component.prototype.hasInputs = function () {
        return this.inputs.length > 0;
    };

    Component.prototype.hasOutputs = function () {
        return this.outputs.length > 0;
    };

    Component.prototype.hasProperties = function () {
        return this.properties.length > 0;
    };

    Component.prototype.inputStream = function(name) {
        return $.grep(this.inputs, function (inputStream) { return inputStream.name == name })[0]
    };

    Component.prototype.outputStream = function(name) {
        return $.grep(this.outputs, function (outputStream) { return outputStream.name == name })[0]
    };

    return Component;
})