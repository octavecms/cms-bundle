<?php

namespace VideInfra\CMSBundle;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Bundle\Bundle;
use VideInfra\CMSBundle\DependencyInjection\Compiler\BlockTypesPass;
use VideInfra\CMSBundle\DependencyInjection\Compiler\PageTypesPass;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class VideInfraCMSBundle extends Bundle
{
    /**
     * @param ContainerBuilder $container
     */
    public function build(ContainerBuilder $container)
    {
        $container->addCompilerPass(new PageTypesPass());
        $container->addCompilerPass(new BlockTypesPass());
    }
}