<?php

namespace Octave\CMSBundle;

use Octave\CMSBundle\DependencyInjection\Compiler\TextPageExtensionPass;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Bundle\Bundle;
use Octave\CMSBundle\DependencyInjection\Compiler\BlockTypesPass;
use Octave\CMSBundle\DependencyInjection\Compiler\PageTypesPass;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class OctaveCMSBundle extends Bundle
{
    /**
     * @param ContainerBuilder $container
     */
    public function build(ContainerBuilder $container)
    {
        $container->addCompilerPass(new PageTypesPass());
        $container->addCompilerPass(new BlockTypesPass());
        $container->addCompilerPass(new TextPageExtensionPass());
    }
}