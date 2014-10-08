app.factory('ClusterStatus', function(Topology) {

    function ClusterStatus(state, time, pipeline) {
        this.state = state;
        this.time = time;
        this.pipeline = pipeline;
    }

    ClusterStatus.build = function (data) {
        var pipeline = data.pipeline ? Topology.build(data.pipeline) : null;
        return new ClusterStatus(data.state, data.time, pipeline);
    };

    return ClusterStatus;
});

app.factory('Cluster', function(ClusterStatus, $http) {

    function Cluster(id, name, status) {
        this.id = id;
        this.name = name;
        this.status = status;
    }

    Cluster.build = function (data) {
        return new Cluster(data.id, data.name, ClusterStatus.build(data.status));
    };

    Cluster.findById = function(id) {
        return $http.get('api/clusters/' + id).then(function(cluster) {
            return Cluster.build(cluster.data);
        });
    };

    Cluster.prototype.deploy = function(topologyId) {
        return $http.post('api/clusters/' + this.id  + "/deploy?pipelineId=" + topologyId);
    };

    Cluster.prototype.stop = function(topologyId) {
        return $http.post('api/clusters/' + this.id  + "/stop");
    };

    Cluster.prototype.isRunning = function() {
        return this.status.state == "Running";
    };

    Cluster.prototype.isReadyToDeploy = function() {
        return this.status.state == "Running" || this.status.state == "Stopped";
    };

    Cluster.prototype.updateStatus = function() {
        var self = this;
        $http.get('api/clusters/' + self.id + '/status').then(function(status) {
            self.status = ClusterStatus.build(status.data);
        });
    };

    return Cluster;
});